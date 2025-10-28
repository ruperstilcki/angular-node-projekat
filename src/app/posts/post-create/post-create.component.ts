// post-create.component.ts

import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { filter, map, switchMap, tap } from 'rxjs';
import { mimeType } from './mime-type.validators';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-create',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.scss',
})
export class PostCreateComponent implements OnInit {
  // Inject dependencies
  private readonly postService = inject(PostService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Signal for holding the post ID if editing
  private readonly postId: WritableSignal<string | null> = signal<string | null>(null);
  // Signal to preview selected image
  imagePreview: WritableSignal<string | null> = signal<string | null>(null);

  // Reactive form definition
  form: FormGroup = this.fb.group({
    id: [null],
    title: [null, [Validators.required, Validators.minLength(3)]],
    content: [null, Validators.required],
    image: [null, [Validators.required], [mimeType]], // Async validator for image file type
  });

  // Getters for easier access to form controls
  get titleCtrl() {
    return this.form.get('title');
  }

  get contentCtrl() {
    return this.form.get('content');
  }

  get imageCtrl() {
    return this.form.get('image');
  }

  ngOnInit(): void {
    // If a postId param is present in route, fetch post data and populate form
    this.route.paramMap.pipe(
      map(paramMap => paramMap.get('postId') ?? null),
      tap(postId => this.postId.set(postId)),
      filter(postId => !!postId),
      switchMap(postId => this.postService.getPostHttp(postId!)),
    ).subscribe(post => this.buildForm(post));
  }

  // Fill form with data when editing a post
  buildForm(post: Post) {
    const { imagePath, ...postFormValues } = post;
    this.form.setValue({ ...postFormValues, image: imagePath });
  }

  // Handle form submission for both add and update
  onSavePost() {
    if (this.form.invalid) {
      return; // Do not proceed if form is invalid
    }

    const { image, ...form } = this.form.getRawValue();

    // Determine if we are creating or updating
    const postService = this.postId()
      ? this.postService.updatePostHttp(form, image)
      : this.postService.addPostHttp(form, image);

    // Execute API call and navigate back on success
    postService.subscribe(() => {
      this.router.navigate(['/']);
    });

    this.form.reset();
    this.resetValidationState();
  }

  // Reset form validation states
  resetValidationState() {
    Object.values(this.form.controls).forEach(control => {
      control.markAsPristine();
      control.markAsUntouched();
    });
  }

  // Handle file input for image and create preview
  onImagePicker(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input?.files && input.files.length > 0) {
      const file = input.files[0];
      this.form.patchValue({ image: file });
      this.form.get('image')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // No file selected (optional fallback logic)
    }
  }

}
