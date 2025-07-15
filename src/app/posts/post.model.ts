export interface Post {
    id: string | null,
    title: string,
    content: string,
    imagePath?: string,
}

export interface PostRespons {
    _id: string,
    title: string,
    content: string,
    imagePath?: string
}

export interface Pagination {
    totalPosts: number;
    postPerPage: number;
    pageSizeOptions: number[];
    currentPage: number;
}
