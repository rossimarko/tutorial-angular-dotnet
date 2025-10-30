namespace ProjectTracker.API.Models.Common;

/// <summary>
/// Pagination request parameters
/// </summary>
public class PaginationRequest
{
    private const int MaxPageSize = 100;
    private const int DefaultPageSize = 10;

    /// <summary>
    /// Page number (1-based)
    /// </summary>
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Items per page
    /// </summary>
    private int _pageSize = DefaultPageSize;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value < 1 ? DefaultPageSize : value;
    }

    /// <summary>
    /// Search term
    /// </summary>
    public string? SearchTerm { get; set; }

    /// <summary>
    /// Sort column name
    /// </summary>
    public string? SortBy { get; set; }

    /// <summary>
    /// Sort direction (asc or desc)
    /// </summary>
    public string SortDirection { get; set; } = "asc";
}

/// <summary>
/// Paginated response
/// </summary>
public class PaginatedResponse<T>
{
    /// <summary>
    /// Current page number
    /// </summary>
    public int PageNumber { get; set; }

    /// <summary>
    /// Page size
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total number of items
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages => (TotalCount + PageSize - 1) / PageSize;

    /// <summary>
    /// Whether there are more pages
    /// </summary>
    public bool HasNextPage => PageNumber < TotalPages;

    /// <summary>
    /// Whether there are previous pages
    /// </summary>
    public bool HasPreviousPage => PageNumber > 1;

    /// <summary>
    /// The items in this page
    /// </summary>
    public required List<T> Items { get; set; }

    /// <summary>
    /// Create a paginated response
    /// </summary>
    public static PaginatedResponse<T> Create(
        int pageNumber,
        int pageSize,
        int totalCount,
        List<T> items)
    {
        return new()
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            Items = items
        };
    }
}

/// <summary>
/// Response for infinite scroll pagination
/// </summary>
public class InfiniteScrollResponse<T>
{
    /// <summary>
    /// Items returned
    /// </summary>
    public required List<T> Items { get; set; }

    /// <summary>
    /// Whether there are more items to load
    /// </summary>
    public bool HasMore { get; set; }

    /// <summary>
    /// Total count of all items
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Create an infinite scroll response
    /// </summary>
    public static InfiniteScrollResponse<T> Create(
        List<T> items,
        int totalCount,
        int pageSize)
    {
        return new()
        {
            Items = items,
            TotalCount = totalCount,
            HasMore = items.Count < totalCount
        };
    }
}