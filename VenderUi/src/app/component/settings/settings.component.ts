import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingService } from '../../services/setting.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  settingsForm!: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private settingService: SettingService,
    private toastr: ToastrService 
  ) {}

  ngOnInit(): void {

    this.settingsForm = this.fb.group({
      id: [0],  
      minExpirationMonths: ['', Validators.required],
      manufacturingDays: ['', Validators.required],
      expiryTokenHours: ['', Validators.required]   
    });

    this.loadSettings();
  }

  loadSettings() {
    this.settingService.getSettings().subscribe(res => {

      if (res) {
        this.settingsForm.patchValue({
          id: res.id,   
          minExpirationMonths: res.minExpiryMonths,
          manufacturingDays: res.manufacturingDays,
          expiryTokenHours: res.expiryTokenHrs   // patch token expiry hours
        });
      }
    });
  }

  updateSettings() {

    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const payload = {
      id: this.settingsForm.value.id,
      minExpiryMonths: this.settingsForm.value.minExpirationMonths,
      manufacturingDays: this.settingsForm.value.manufacturingDays,
      expiryTokenHrs: this.settingsForm.value.expiryTokenHours   // send token expiry hours
    };

    console.log('UPDATE PAYLOAD:', payload);

    this.isSaving = true;

    this.settingService.updateSettings(payload)
      .subscribe({
        next: (res) => {

          this.isSaving = false;

          if (res.status === 1) {
            this.toastr.success('Settings Updated Successfully');  
          }
          else {
            this.toastr.warning(res.message);  
          }
        },
        error: () => {
          this.isSaving = false;
          this.toastr.error('Update Failed'); 
        }
      });
  }

  get f() {
    return this.settingsForm.controls;
  }
}