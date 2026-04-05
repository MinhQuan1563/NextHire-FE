import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '@app/services/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ToastModule,
    RouterModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private activeRoute: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      userNameOrEmail: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }
  
  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      if (params['locked']) {
        this.toastService.showError(
          'Account Suspended',
          'Your account has been locked by the Administrator. You have been logged out.',
        );
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.isLoading = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.loginForm.value)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          let errorMsg = '';

          if (err.error?.error_description) {
            errorMsg = err.error.error_description;
          }
          else if (err.error?.error?.data?.Body) {
            try {
              const innerBody = JSON.parse(err.error.error.data.Body);
              errorMsg = innerBody.error_description || err.error.error.message || '';
            } 
            catch (e) {
              errorMsg = err.error.error.message || '';
            }
          }
          else {
            errorMsg = err.error?.error?.message || err.error?.message || '';
          }

          if (errorMsg.toLowerCase().includes('locked out') || errorMsg.toLowerCase().includes('đã bị khóa')) {
            this.toastService.showError(
              'Access Denied',
              'Your account is currently locked. Please contact support for assistance.'
            );
          }
          else {
            this.toastService.showError(
              'Login Failed',
              'Invalid username or password.'
            );
          }
        }
      });
  }
}