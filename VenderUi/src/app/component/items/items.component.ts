import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemService } from '../../services/item.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit {

  itemForm!: FormGroup;
  searchForm!: FormGroup;

  itemList: any[] = [];

  isEditMode: boolean = false;
  selectedItemId: number | null = null;

  pageNumber: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;

  pageSizeOptions: number[] = [10, 25, 50, 100];

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForms();

    
    this.route.queryParams.subscribe(params => {

      this.pageNumber = +params['pageNumber'] || 1;
      this.pageSize = +params['pageSize'] || 10;

      const searchCode = params['searchItemCode'] || '';
      this.searchForm.get('searchItemCode')?.setValue(searchCode);

      this.loadItems();
    });
  }

  initForms() {
    this.itemForm = this.fb.group({
      itemCode: ['', Validators.required],
      itemDescription: [''],
      upc: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
    });

    this.searchForm = this.fb.group({
      searchItemCode: ['']
    });
  }

  
  loadItems() {

    const searchCode = this.searchForm.get('searchItemCode')?.value || '';

    this.itemService.getAllItems(searchCode, this.pageNumber, this.pageSize)
      .subscribe({
        next: (res: any) => {

          console.log('API Response:', res);

          
          this.totalCount = res.totalCount ?? 0;

          this.itemList = (res.data || []).map((item: any) => ({
            ItemID: item.itemID,
            ItemCode: item.itemCode,
            ItemDescription: item.itemDescription,
            UPC: item.upc
          }));
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to load items', 'Error');
        }
      });
  }

  
  onSubmit() {

    if (this.itemForm.invalid) return;

    const data = { ...this.itemForm.value };

    if (this.isEditMode && this.selectedItemId) {

      data.itemID = this.selectedItemId;

      this.itemService.updateItem(data).subscribe({
        next: (res: any) => {
          if (res.status === 1) {
            this.loadItems();
            this.resetForm();
            this.toastr.success(res.message || 'Item updated', 'Success');
            this.closeModal();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Update failed', 'Error');
        }
      });

    } else {

      this.itemService.addItem(data).subscribe({
        next: (res: any) => {
          if (res.status === 1) {
            this.loadItems();
            this.resetForm();
            this.toastr.success(res.message || 'Item added', 'Success');
            this.closeModal();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Insert failed', 'Error');
        }
      });
    }
  }

 
  onEdit(item: any) {

    this.isEditMode = true;
    this.selectedItemId = item.ItemID;

    this.itemForm.patchValue({
      itemCode: item.ItemCode,
      itemDescription: item.ItemDescription,
      upc: item.UPC
    });

    const modalEl = document.getElementById('itemModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  
onDelete(id: number) {

  Swal.fire({
    title: 'Are you sure?',
    text: 'You want to delete this item?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {

    if (result.isConfirmed) {

      this.itemService.deleteItem(id).subscribe({
        next: () => {

          this.toastr.success('Item deleted successfully', 'Success');

          this.loadItems();
        },
        error: () => {

          this.toastr.error('Delete failed', 'Error');
        }
      });

    }

  });
}
  
  resetForm() {
    this.isEditMode = false;
    this.selectedItemId = null;
    this.itemForm.reset();
  }

 
  closeModal() {
    const modalEl = document.getElementById('itemModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    }
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
        searchItemCode: this.searchForm.get('searchItemCode')?.value || '',
        pageNumber: this.pageNumber,
        pageSize: this.pageSize
      },
      queryParamsHandling: 'merge'
    });
  }
}