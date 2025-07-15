// post-list.component.ts

import { Component, inject, OnInit, Signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';

import { PostService } from '../../services/post.service';
import { Pagination, Post } from '../post.model';
import { createPageEvent } from '../../helper';

@Component({
  selector: 'app-post-list',
  imports: [CommonModule, MatExpansionModule, RouterLink, MatPaginatorModule, MatButtonModule],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.scss',
})
export class PostListComponent implements OnInit {
  // Inject PostService instance
  postService = inject(PostService);

  // Reactive signal for pagination configuration (total count, current page, etc.)
  readonly paginator: Signal<Pagination> = this.postService.getPaginationConfig();

  // Reactive signal for current list of posts
  readonly posts: Signal<Post[]> = this.postService.getPosts();

  // Reference to the accordion element (to close all on deletion, etc.)
  @ViewChild(MatAccordion) accordion: MatAccordion | undefined;

  ngOnInit() {
    // Initialize page with default values on component load
    this.initPage();
  }

  /**
   * Delete a post and refresh the list and paginator afterward.
   * Also closes all expanded accordion panels.
   */
  onDelete(postId: string) {
    this.postService.deletePostHttp(postId).subscribe(() => {
      this.initPage();
      this.accordion?.closeAll();
    });
  }

  /**
   * Called when the paginator changes page or page size
   */
  onChangedPage(pageData: PageEvent) {
    this.postService.setPostPerPage(pageData.pageSize);
    this.postService.setCurrentPage(pageData.pageIndex + 1); // Angular paginator is 0-indexed
    this.postService.fetchInitialPosts();
  }

  /**
   * Resets the pagination to the first page and triggers post loading
   */
  initPage() {
    this.onChangedPage(createPageEvent(0, 2));
  }

}
