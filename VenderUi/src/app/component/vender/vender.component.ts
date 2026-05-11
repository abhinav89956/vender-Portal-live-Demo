import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenderService, AssignDto } from '../../services/vender.service';
import { ItemService } from '../../services/item.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';


declare var bootstrap: any;

@Component({
  selector: 'app-vender',
  templateUrl: './vender.component.html',
  styleUrls: ['./vender.component.scss']
})
export class VenderComponent implements OnInit {

  vendorForm!: FormGroup;
  searchForm!: FormGroup;
  assignForm!: FormGroup;

  vendorList: any[] = [];
  vendorDropdown: any[] = [];
  itemList: any[] = [];

  showForm = false;
  showAssignPopup = false;
  isEditMode = false;

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;

  pageSizeOptions: number[] = [10, 25, 50, 100];

  constructor(
    private fb: FormBuilder,
    private vendorService: VenderService,
    private itemService: ItemService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForms();

    this.route.queryParams.subscribe(params => {
      this.pageNumber = +params['pageNumber'] || 1;
      this.pageSize = +params['pageSize'] || 10;
      const searchCode = params['searchVenderCode'] || '';
      this.searchForm.get('searchVenderCode')?.setValue(searchCode);

      this.loadVendors();
    });

    this.loadDropdown();
    this.loadItems();
  }

  initForms() {
    this.vendorForm = this.fb.group({
      venderId: [0],
      venderCode: ['', Validators.required],
      codeDescription: [''],
      email: ['', [Validators.required, Validators.email]],
      isActive: [true]
    });

    this.searchForm = this.fb.group({
      searchVenderCode: ['']
    });

    this.assignForm = this.fb.group({
      venderCode: [null, Validators.required],
      itemCode: [null, Validators.required]
    });
  }

  loadVendors() {
    const code = this.searchForm.value.searchVenderCode || '';

    this.vendorService.getAllVendors(code, this.pageNumber, this.pageSize)
      .subscribe({
        next: (res: any) => {
          this.totalCount = res.totalCount ?? 0;
          this.vendorList = res.data ?? [];
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Failed to load vendors')
      });
  }

  loadDropdown() {
    this.vendorService.getAllVendors('', 1, 1000)
      .subscribe({
        next: (res: any) => this.vendorDropdown = res.data ?? [],
        error: (err) => console.log(err)
      });
  }

  loadItems() {
    this.itemService.getAllItems('', 1, 1000)
      .subscribe({
        next: (res: any) => this.itemList = res.data ?? [],
        error: (err) => console.log(err)
      });
  }

  openAddForm() {
    this.vendorForm.reset({ venderId: 0, isActive: true });
    this.isEditMode = false;
    this.showForm = true;
  }

  editVendor(vendor: any) {
    this.vendorForm.patchValue(vendor);
    this.isEditMode = true;
    this.showForm = true;
  }

  saveVendor() {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      this.toastr.warning('Enter valid details');
      return;
    }

    const data = this.vendorForm.value;

    const request = this.isEditMode
      ? this.vendorService.updateVendor(data)
      : this.vendorService.addVendor(data);

    request.subscribe({
      next: () => {
        this.toastr.success(this.isEditMode ? 'Vendor Updated' : 'Vendor Added');
        this.cancelForm();
        this.loadVendors();
      },
      error: (err) =>
        this.toastr.error(err?.error?.message || 'VendorCode/Email already exists')
    });
  }

  deleteVendor(id: number) {

  Swal.fire({
    title: 'Are you sure?',
    text: 'You want to delete this vendor?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {

    if (result.isConfirmed) {

      this.vendorService.deleteVendor(id).subscribe({
        next: () => {
          this.toastr.success('Vendor Deleted');
          this.loadVendors();
        },
        error: (err) =>
          this.toastr.error(err?.error?.message || 'Delete failed')
      });

    }

  });
}

  cancelForm() { this.showForm = false; }

  openAssignPopup() { this.assignForm.reset(); this.showAssignPopup = true; }
  closeAssignPopup() { this.showAssignPopup = false; }

  assignItems() {
    if (this.assignForm.invalid) {
      this.toastr.warning('Select Vendor & Item');
      return;
    }

    const payload: AssignDto = this.assignForm.value;

    this.vendorService.assignItems(payload).subscribe({
      next: () => {
        this.toastr.success('Item Assigned');
        this.closeAssignPopup();
      },
      error: (err) =>
        this.toastr.error(err?.error?.message || 'Already assigned')
    });
  }

  unAssignItems() {
    if (this.assignForm.invalid) {
      this.toastr.warning('Select Vendor & Item');
      return;
    }

    const payload: AssignDto = this.assignForm.value;

    this.vendorService.unAssignItems(payload).subscribe({
      next: () => {
        this.toastr.success('Item Unassigned');
        this.closeAssignPopup();
      },
      error: (err) =>
        this.toastr.error(err?.error?.message || 'Not assigned')
    });
  }
toggleActive(vendor: any) {

  const newStatus = !vendor.isActive;

  Swal.fire({
    title: 'Are you sure?',
    text: `You want to ${newStatus ? 'activate' : 'deactivate'} this vendor?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel'
  }).then((result) => {

    if (result.isConfirmed) {

      const payload = {
        venderId: vendor.venderId,
        venderCode: vendor.venderCode,
        email: vendor.email,
        codeDescription: vendor.codeDescription,
        isActive: newStatus
      };

      this.vendorService.updateVendor(payload).subscribe({
        next: () => {
          vendor.isActive = newStatus;
          this.toastr.success(newStatus ? 'Vendor activated' : 'Vendor deactivated');
        },
        error: (err) =>
          this.toastr.error(err?.error?.message || 'Failed to update status')
      });

    }

  });
}
  totalPages(): number {
    return Math.max(Math.ceil(this.totalCount / this.pageSize), 1);
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.pageNumber = page;
    this.updateUrl();
  }

  onPageSizeChange(event: any) {
    this.pageSize = +event.target.value;
    this.pageNumber = 1;
    this.updateUrl();
  }

  onSearch() {
    this.pageNumber = 1;
    this.updateUrl();
  }

  onRefresh() {
    this.searchForm.reset();
    this.pageNumber = 1;
    this.updateUrl();
  }

  updateUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        searchVenderCode: this.searchForm.get('searchVenderCode')?.value || '',
        pageNumber: this.pageNumber,
        pageSize: this.pageSize
      },
      queryParamsHandling: 'merge'
    });
  }

}