export interface Post {
    id: string | null,
    title: string,
    content: string,
    imagePath?: string,
    creator?: string
}

export interface PostRespons {
    _id: string,
    title: string,
    content: string,
    imagePath?: string,
    creator?: string
}

export interface Pagination {
    totalPosts: number;
    postPerPage: number;
    pageSizeOptions: number[];
    currentPage: number;
}
