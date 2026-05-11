import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  vendorForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {

    this.vendorForm = this.fb.group({
      venderCode: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      lotVender: [{ value: '', disabled: true }],
      codeDescription: [{ value: '', disabled: true }],
      insertedDate: [{ value: '', disabled: true }]
    });

    const userId = Number(localStorage.getItem('userId'));

    if (userId) {
      this.dashboardService.getVendor(userId).subscribe({
        next: (res: any) => {
          this.vendorForm.patchValue({
            venderCode: res.venderCode,
            email: res.email,
            lotVender: res.lotVender,
            codeDescription: res.codeDescription,
            insertedDate: res.insertedDate
          });
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }
}