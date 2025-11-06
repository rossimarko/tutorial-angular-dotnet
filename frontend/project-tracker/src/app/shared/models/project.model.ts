/// <summary>
/// Project entity model
/// </summary>
export interface Project {
  id: number;
  userId: number;
  title: string;
  description?: string;
  status: string;
  priority: number;
  startDate?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/// <summary>
/// Request to create a new project
/// </summary>
export interface CreateProjectRequest {
  title: string;
  description?: string;
  status: string;
  priority: number;
  startDate?: Date;
  dueDate?: Date;
}

/// <summary>
/// Request to update an existing project
/// </summary>
export interface UpdateProjectRequest extends CreateProjectRequest {}

/// <summary>
/// Paged result wrapper - matches backend response structure
/// </summary>
export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: T[];
}

/// <summary>
/// Project-specific pagination type
/// </summary>
export type ProjectPaginatedResponse = PaginatedResponse<Project>;

/// <summary>
/// Pagination parameters for API requests
/// </summary>
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/// <summary>
/// Project filters with pagination
/// </summary>
export interface ProjectFilters extends PaginationParams {
  status?: string;
  priority?: number;
}
