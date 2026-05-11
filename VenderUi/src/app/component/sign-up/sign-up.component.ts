import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  signUpForm!: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      venderCode: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }


  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null : { mismatch: true };
  }

  get f() {
    return this.signUpForm.controls;
  }

 
  onSubmit(): void {

    this.submitted = true;

    if (this.signUpForm.invalid) {
      this.toastr.error('Please fill all required fields', 'Error ❌');
      return;
    }

    const { email, password, venderCode } = this.signUpForm.value;

    this.loading = true;

    this.loginService.SignUp(email, password, venderCode).subscribe({

      next: (res) => {
        this.loading = false;
        if (res.status === 1) {

          this.toastr.success(res.message);

          this.signUpForm.reset();
          this.submitted = false;

        } else {

          this.toastr.error(res.message || 'Registration Failed', 'Error ❌');
        }
      },

      error: (err) => {
        this.loading = false;

        console.error(err);
        this.toastr.error('Server Error', 'Error ❌');
      }
    });
  }
}
