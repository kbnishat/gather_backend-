import { Model } from "mongoose";

//this type is used to define the input type for the list query, it is a record of string keys and unknown values
export type ListQueryInput = Record<string, unknown>;

export interface ListQueryConfig {
  searchableFields?: string[];
  baseFilter?: Record<string, unknown>;
  defaultLimit?: number;
  defaultSort?: string;
}

export interface ParsedListQuery {
  filter: Record<string, unknown>;
  page: number;
  limit: number;
  skip: number;
  sort: string;
  select: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Turns request query params into a Mongoose filter plus pagination/sort/select options.
 * Reuse across list endpoints by passing different `searchableFields` / `baseFilter`.
 */
export function parseListQuery(
  query: ListQueryInput,
  config: ListQueryConfig = {},
): ParsedListQuery {
  // destructuring the config object to get the searchableFields, baseFilter, defaultLimit, and defaultSort
  const {
    searchableFields = [],
    baseFilter = { isDeleted: false },
    defaultLimit = 10,
    defaultSort = "-createdAt",
  } = config;

  // destructuring the query object to get the searchTerm, page, limit, sort, fields, and filters
  const {
    searchTerm,
    page: rawPage = 1,
    limit: rawLimit = defaultLimit,
    sort = defaultSort,
    fields,
    ...filters
  } = query;

  const filter: Record<string, unknown> = {
    ...baseFilter,
    ...filters,
  };

  if (
    searchTerm &&
    typeof searchTerm === "string" &&
    searchTerm.trim() &&
    searchableFields.length > 0
  ) {
    filter.$or = searchableFields.map((field) => ({
      [field]: { $regex: searchTerm, $options: "i" },
    }));
  }

  const page = Math.max(1, Number(rawPage) || 1);
  const limit = Math.max(1, Number(rawLimit) || defaultLimit);
  const skip = (page - 1) * limit;
  const select =
    fields !== undefined && fields !== null && String(fields).length > 0
      ? String(fields).split(",").join(" ").trim()
      : "";

  return {
    filter,
    page,
    limit,
    skip,
    sort: String(sort),
    select,
  };
}

/**
 * Runs find + countDocuments in parallel. Optional `configure` applies populate / lean / etc.
 * Chain order: find → configure (e.g. populate) → sort → skip → limit → select.
 */
type FindQuery<T> = ReturnType<Model<T>["find"]>;

export async function paginate<T>(
  model: Model<T>,
  parsed: ParsedListQuery,
  configure?: (query: FindQuery<T>) => FindQuery<T>,
): Promise<{ meta: PaginationMeta; data: T[] }> {
    // this is the base query for the model, its stored in the mongoQuery variable
  let mongoQuery: FindQuery<T> = model.find(parsed.filter);

  if (configure) {
    mongoQuery = configure(mongoQuery);
  }

  mongoQuery = mongoQuery
    .sort(parsed.sort)
    .skip(parsed.skip)
    .limit(parsed.limit);

  if (parsed.select) {
    mongoQuery = mongoQuery.select(parsed.select);
  }

  const [data, total] = await Promise.all([
    mongoQuery.exec(),
    model.countDocuments(parsed.filter),
  ]);

  return {
    meta: {
      total,
      page: parsed.page,
      limit: parsed.limit,
      totalPages: Math.ceil(total / parsed.limit),
    },
    data,
  };
}
