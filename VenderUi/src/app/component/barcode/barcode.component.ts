import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenderService } from '../../services/vender.service';
import { BarCodeService } from '../../services/bar-code.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { SettingService } from '../../services/setting.service';

@Component({
  selector: 'app-barcode',
  templateUrl: './barcode.component.html',
  styleUrls: ['./barcode.component.scss']
})
export class BarcodeComponent implements OnInit {

  barcodeForm!: FormGroup;
  expiryForm!: FormGroup;

  vendors: any[] = [];
  items: any[] = [];
  settings: any;

  minExpiryDate: string | null = null;
  isLoadingItems = false;

  currentStep: number = 1;

  generatedVendor = '';
  generatedItem = '';
  generatedVarCode = '';
  generatedPdfBlob: Blob | null = null;
  generatedBarcodeBase64: string | null = null;

  isAdmin: boolean = false;
  loggedInVendorCode: string = '';

  constructor(
    private fb: FormBuilder,
    private vendorService: VenderService,
    private barcodeService: BarCodeService,
    private settingService: SettingService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {

    this.initForms();
    this.detectUser();
    this.loadSettings();

    if (this.isAdmin) {
      this.loadVendors();
    }
  }

  detectUser() {

    const userId = Number(localStorage.getItem('userId'));

    this.isAdmin = userId === 9;
    this.loggedInVendorCode = localStorage.getItem('venderCode') || '';

    if (!this.isAdmin && this.loggedInVendorCode) {

      this.barcodeForm.patchValue({
        venderCode: this.loggedInVendorCode
      });

      this.barcodeForm.get('venderCode')?.disable();
      this.onVendorChange(); 
    }
  }

  initForms() {

    this.barcodeForm = this.fb.group({
      venderCode: ['', Validators.required],
      itemCode: ['', Validators.required],
      manufacturingDate: ['', Validators.required]
    });

    this.expiryForm = this.fb.group({
      needExpiry: ['no', Validators.required],
      dateFormat: ['yyyy/MM', Validators.required],
      expiryDate: ['']
    });

 
    this.barcodeForm.get('venderCode')?.valueChanges.subscribe(() => {
      this.onVendorChange();
    });

   
    this.barcodeForm.get('manufacturingDate')?.valueChanges.subscribe(mfgDate => {

      if (!mfgDate || !this.settings?.minExpiryMonths) {
        this.minExpiryDate = null;
        return;
      }

      this.calculateMinExpiryDate(mfgDate, this.settings.minExpiryMonths);
    });

  
    this.expiryForm.get('needExpiry')?.valueChanges.subscribe(value => {

      const expiryCtrl = this.expiryForm.get('expiryDate');

      if (value === 'yes')
        expiryCtrl?.setValidators(Validators.required);
      else {
        expiryCtrl?.clearValidators();
        expiryCtrl?.reset();
      }

      expiryCtrl?.updateValueAndValidity();
    });
  }

  loadSettings() {
    this.settingService.getSettings().subscribe(res => {
      this.settings = res;
    });
  }

  calculateMinExpiryDate(mfgDate: string, minMonths: number) {

    const date = new Date(mfgDate);
    date.setMonth(date.getMonth() + minMonths);

    this.minExpiryDate = date.toISOString().split('T')[0];
    this.expiryForm.get('expiryDate')?.reset();
  }

  loadVendors() {
    this.vendorService.getAllVendors('', 1, 100).subscribe({
      next: res => this.vendors = res.data || [],
      error: () => this.toastr.error('Failed to load vendors')
    });
  }

  onVendorChange() {

    const venderCode = this.barcodeForm.getRawValue().venderCode;

    if (!venderCode) {
      this.items = [];
      this.barcodeForm.patchValue({ itemCode: '' });
      return;
    }

    this.isLoadingItems = true;

    this.barcodeService.getVendorItems(venderCode).subscribe({
      next: res => {

        this.isLoadingItems = false;

        if (Array.isArray(res)) {
          this.items = res;
        } else {
          this.items = [];
        }

        this.barcodeForm.patchValue({ itemCode: '' });
      },
      error: () => {
        this.isLoadingItems = false;
        this.items = [];
        this.toastr.error('Failed to load items');
      }
    });
  }

  submitStep1() {

    if (this.barcodeForm.invalid) {
      this.barcodeForm.markAllAsTouched();
      this.toastr.warning('Fill required fields');
      return;
    }

    this.currentStep = 2;
  }

  isExpiryValid(): boolean {

    if (this.expiryForm.value.needExpiry === 'yes') {
      return this.expiryForm.valid;
    }

    return true;
  }

  async submitStep2() {

    if (!this.isExpiryValid()) {
      this.expiryForm.markAllAsTouched();
      this.toastr.warning('Select expiry details');
      return;
    }

    const data = {
      ...this.barcodeForm.getRawValue(),
      expiryNeeded: this.expiryForm.value.needExpiry === 'yes',
      expiryDate: this.expiryForm.value.expiryDate,
      expiryFormat: this.expiryForm.value.dateFormat
    };

    try {

      Swal.fire({
        title: 'Generating Barcode...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const result: any = await firstValueFrom(
        this.barcodeService.insertBarCode(data)
      );

      Swal.close();

      this.generatedVendor = data.venderCode;
      this.generatedItem = data.itemCode;
      this.generatedVarCode = result.varCode;

      this.generatedPdfBlob = this.base64ToBlob(result.pdfBase64, 'application/pdf');
      this.generatedBarcodeBase64 = result.barcodeBase64;

      this.currentStep = 3;

      this.toastr.success('Barcode Generated Successfully');

    } catch {
      Swal.close();
      this.toastr.error('Barcode generation failed');
    }
  }

  base64ToBlob(base64: string, type: string): Blob {

    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));

    return new Blob([new Uint8Array(byteNumbers)], { type });
  }

  downloadPdf() {

    if (!this.generatedPdfBlob) return;

    const url = window.URL.createObjectURL(this.generatedPdfBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.generatedVarCode}.pdf`;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  restart() {

    this.currentStep = 1;
    this.generatedVendor = '';
    this.generatedItem = '';
    this.generatedVarCode = '';
    this.generatedPdfBlob = null;
    this.generatedBarcodeBase64 = null;

    this.barcodeForm.reset();
    this.expiryForm.reset({ needExpiry: 'no', dateFormat: 'yyyy/MM' });

    if (!this.isAdmin && this.loggedInVendorCode) {
      this.barcodeForm.patchValue({ venderCode: this.loggedInVendorCode });
      this.barcodeForm.get('venderCode')?.disable();
      this.onVendorChange();
    }
  }
}