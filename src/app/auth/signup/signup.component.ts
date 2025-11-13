import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-signup',
  imports: [MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

    private readonly destroyRef = inject(DestroyRef); // Inject DestroyRef

  // Reactive form definition
  form: FormGroup = this.fb.group({
    email: [null, [Validators.required, Validators.minLength(3), Validators.email]],
    password: [null, Validators.required]
  });

  // Getters for easier access to form controls
  get emailCtrl() {
    return this.form.get('email');
  }

  get passwordCtrl() {
    return this.form.get('password');
  }

  onSignup() {
    if (this.form.invalid) {
      return;
    }
    this.authService.createUser(this.form.getRawValue()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: message => {
        console.log('User created:', message);
      },
      error: err => {
        console.error('Signup error:', err.message);
      }
    });
  }
}
