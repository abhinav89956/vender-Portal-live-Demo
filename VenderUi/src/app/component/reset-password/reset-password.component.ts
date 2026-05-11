import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {

  resetForm: FormGroup;
  submitted = false;
  loading = false;


  otpSent = false;
  otpVerified = false;

  constructor(
    private fb: FormBuilder,
    private userService: LoginService,
    private toastr: ToastrService
  ) {
    this.resetForm = this.fb.group(
      {
        venderCode: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        otp: [''],
        password: [''],
        confirmPassword: ['']
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  get f() {
    return this.resetForm.controls;
  }


  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (!password && !confirmPassword) return null;

    return password === confirmPassword
      ? null
      : { passwordMismatch: true };
  }

 
  sendOtp() {
    this.submitted = true;

    if (this.f['email'].invalid || this.f['venderCode'].invalid) {
      this.toastr.warning('Enter valid Email & Vendor Code', 'Validation ⚠');
      return;
    }

    this.loading = true;

    const { email, venderCode } = this.resetForm.value;

    this.userService.sendOtp(email, venderCode).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res.status === 1) {
          this.otpSent = true;
          this.toastr.success(res.message, 'OTP Sent');
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Server Error', 'Error');
        console.error(err);
      }
    });
  }


  verifyOtp() {
    const otpValue = this.resetForm.value.otp;

    if (!otpValue) {
      this.toastr.warning('Enter OTP', 'Validation ⚠');
      return;
    }

    const email = this.resetForm.value.email;
    const OtpCode = otpValue; 

    this.loading = true;

    this.userService.verifyOtp(email, OtpCode).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res.status === 1) {
          this.otpVerified = true;
          this.toastr.success(res.message, 'OTP Verified ✅');
        } else {
          this.toastr.error(res.message, 'Invalid OTP ❌');
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Server Error', 'Error ❌');
        console.error(err);
      }
    });
  }


  resetPassword() {
    this.submitted = true;

    if (this.f['password'].invalid || this.f['confirmPassword'].invalid) {
      this.toastr.warning('Enter Password', 'Validation ⚠');
      return;
    }

    if (this.resetForm.errors?.['passwordMismatch']) {
      this.toastr.error('Passwords do not match', 'Error ❌');
      return;
    }

    const email = this.resetForm.value.email;
    const password = this.resetForm.value.password;

    this.loading = true;

    this.userService.resetPassword(email, password).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res.status === 1) {
          this.toastr.success(res.message, 'Success ✅');

          this.resetForm.reset();
          this.otpSent = false;
          this.otpVerified = false;
          this.submitted = false;

        } else {
          this.toastr.error(res.message, 'Error ❌');
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Server Error', 'Error ❌');
        console.error(err);
      }
    });
  }

}
