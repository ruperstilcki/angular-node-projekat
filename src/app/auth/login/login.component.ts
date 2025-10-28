import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // Reactive form definition
  form: FormGroup = this.fb.group({
    email: [null, [Validators.required, Validators.minLength(3), Validators.email]],
    password: [null, Validators.required],
  });

  // Getters for easier access to form controls
  get emailCtrl() {
    return this.form.get('email');
  }

  get passwordCtrl() {
    return this.form.get('password');
  }

  onLogin(){
    if(this.form.invalid) {return;}
    this.authService.login(this.form.getRawValue()).subscribe();
  }

}
