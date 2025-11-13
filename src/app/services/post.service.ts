// post.service.ts

import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Pagination, Post, PostRespons } from '../models/post.model';
import { REST_URL } from '../tokens/app-config.tokes';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly baseUrl: string = inject(REST_URL);

  // Writable signal to hold the list of posts
  private readonly posts: WritableSignal<Post[]> = signal<Post[]>([]);

  // Writable signal to handle pagination configuration and state
  private readonly paginator: WritableSignal<Pagination> = signal<Pagination>({
    totalPosts: 0, // Total number of posts in the backend
    postPerPage: 2, // Default number of posts per page
    pageSizeOptions: [1, 2, 5, 10], // Options for paginator dropdown
    currentPage: 1 // Default to page 1
  });

  // Dependency injection for HTTP client
  private readonly http = inject(HttpClient);

    private readonly destroyRef = inject(DestroyRef); // Inject DestroyRef

  constructor() {
    // Automatically fetch posts when the service is initialized
    this.fetchInitialPosts();
  }

  /**
   * Load posts and update the local signal
   */
  fetchInitialPosts() {
    this.getPostsHttp().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(posts => {
      this.posts.set(posts);
    });
  }

  /**
   * Returns a signal containing pagination settings
   */
  getPaginationConfig(): WritableSignal<Pagination> {
    return this.paginator;
  }

  /**
   * Updates the number of posts to be shown per page
   */
  setPostPerPage(postPerPage: number): void {
    this.paginator.update(p => ({ ...p, postPerPage }));
  }

  /**
   * Updates the currently active page index
   */
  setCurrentPage(currentPage: number): void {
    this.paginator.update(p => ({ ...p, currentPage }));
  }

  /**
   * Returns a signal for accessing current post data
   */
  getPosts(): WritableSignal<Post[]> {
    return this.posts;
  }

  /**
   * Fetch paginated posts from the backend and transform the response
   */
  getPostsHttp(): Observable<Post[]> {
    const queryParams = `?pageSize=${this.paginator().postPerPage}&page=${this.paginator().currentPage}`;
    return this.http
      .get<{
        message: string;
        posts: PostRespons[];
        maxPosts: number;
      }>(this.baseUrl + queryParams)
      .pipe(
        // Update total number of posts for paginator
        tap(res => {
          this.paginator.update(p => ({ ...p, totalPosts: res.maxPosts }));
        }),
        // Ensure we work with a default of empty array if undefined
        map(res => res.posts ?? []),
        // Map each post from backend model to frontend post model
        map(postData =>
          postData.map(post => ({
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath,
            creator: post.creator
          }))
        ),
        // Return empty list if HTTP call fails
        catchError(() => of([]))
      );
  }

  /**
   * Fetch a single post by ID from the backend
   */
  getPostHttp(postId: string): Observable<Post> {
    return this.http.get<PostRespons>(this.baseUrl + postId).pipe(
      map(post => ({
        title: post.title,
        content: post.content,
        id: post._id,
        imagePath: post.imagePath
      })),
      catchError(() => of())
    );
  }

  /**
   * Add a new post with image using FormData for mixed file and text
   */
  addPostHttp(post: Post, image: File): Observable<string> {
    const postData = new FormData();
    postData.append('title', post.title);
    postData.append('content', post.content);
    postData.append('image', image, post.title);
    return this.http.post<{ message: string; post: Post }>(this.baseUrl, postData).pipe(map(res => res.message));
  }

  /**
   * Update an existing post; handles both image path string and file object
   */
  updatePostHttp(post: Post, image: File | string): Observable<string> {
    let postData: Post | FormData;

    // If a new file is provided, use FormData
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', post.id!);
      postData.append('title', post.title);
      postData.append('content', post.content);
      postData.append('image', image, post.title);
    } else {
      // Else send plain JSON with existing imagePath
      postData = { ...post, imagePath: image };
    }

    return this.http
      .put<{ message: string; post: Post }>(this.baseUrl + post.id, postData)
      .pipe(map(res => res.message));
  }

  /**
   * Delete a post by its ID
   */
  deletePostHttp(postId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.baseUrl + postId);
  }

    /**
   * Locally add a new post to the signal list
   * This avoids full refetching when a new post arrives via socket
   */
  addPostLocally(post: Post): void {
    this.posts.update(current => [...current, post]); // add new post on top
    this.paginator.update(p => ({ ...p, totalPosts: p.totalPosts + 1 }));
  }

}
