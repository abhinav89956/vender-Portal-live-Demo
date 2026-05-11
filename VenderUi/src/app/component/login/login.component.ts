import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { LoginService } from '../../services/login.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private chatService: ChatService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

login(): void {
  this.submitted = true;

  if (this.loginForm.invalid) {
    this.toastr.error('Please enter valid credentials');
    return;
  }

  this.loading = true;

  const { email, password } = this.loginForm.value;

  this.loginService.login(email, password).subscribe({
    next: (res: any) => {
      this.loading = false;

      if (res && res.status === 1) {
        this.toastr.success(res.Message || 'Login Successful');

        // No SignalR here
        // Navigate directly to dashboard
        this.router.navigate(['/dashboard']);
      } else {
        this.toastr.error(res?.Message || 'Invalid Email / Password');
      }
    },
    error: (err: any) => {
      this.loading = false;
      const message =
        err.error?.Message ||
        err.error?.message ||
        'Login failed';
      this.toastr.error(message);
    }
  });
}
}