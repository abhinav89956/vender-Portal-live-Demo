import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BarCodeService } from '../../services/bar-code.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-barcode-list',
  templateUrl: './barcode-list.component.html',
  styleUrls: ['./barcode-list.component.scss']
})
export class BarcodeListComponent implements OnInit {

  searchForm!: FormGroup;

  barcodeList: any[] = [];
  filteredList: any[] = [];

  loading = false;

  isAdmin: boolean = false;
  loggedInVendorCode: string = '';

  constructor(
    private fb: FormBuilder,
    private barcodeService: BarCodeService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {

    this.detectUser();

    this.searchForm = this.fb.group({
      searchText: [''],
      venderCode: [''],
      itemCode: ['']
    });

    this.loadBarcodes();
  }

  detectUser() {
    const userId = Number(localStorage.getItem('userId'));
    this.isAdmin = userId === 9;
    this.loggedInVendorCode = localStorage.getItem('venderCode') || '';
  }

  loadBarcodes() {

    this.loading = true;

    this.barcodeService.getBarcodes().subscribe({

      next: (res: any) => {

        this.loading = false;

        if (res && res.length > 0 && res[0]?.status === 1) {

          if (this.isAdmin) {
            this.barcodeList = res;
          } else {
            this.barcodeList = res.filter(
              (x: any) => x.venderCode === this.loggedInVendorCode
            );
          }

          this.filteredList = [...this.barcodeList];

        } else {
          this.toastr.warning(res?.[0]?.message || 'No data found');
        }
      },

      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load barcodes');
      }
    });
  }

  reset() {
    this.searchForm.reset();
    this.filteredList = [...this.barcodeList];
  }

  // ================= PRINT SINGLE =================

  print(barcode: any) {

    if (!barcode.barcodeBase64) {
      this.toastr.error('Barcode image not available');
      return;
    }

    const barcodeImage = `data:image/png;base64,${barcode.barcodeBase64}`;

    const printContent = `
      <div style="text-align:center; font-family: Arial; margin-top: 50px;">
        <h3>Barcode: ${barcode.varCode}</h3>
        <p>Item: ${barcode.itemCode}</p>
        <p>Vendor: ${barcode.venderCode}</p>
        <img src="${barcodeImage}" style="margin-top:20px; width:250px;" />
      </div>
    `;

    const newWin = window.open('', '_blank', 'width=600,height=400');
    if (!newWin) return;

    newWin.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
        </head>
        <body>${printContent}</body>
      </html>
    `);

    newWin.document.close();
    newWin.onload = () => {
      newWin.print();
      newWin.close();
    };
  }

  // ================= PRINT ALL =================

  printAll() {

    if (!this.filteredList || this.filteredList.length === 0) {
      this.toastr.warning('No barcodes to print');
      return;
    }

    let printContent = '';

    this.filteredList.forEach(barcode => {

      const barcodeImage = `data:image/png;base64,${barcode.barcodeBase64}`;

      printContent += `
        <div style="text-align:center; page-break-after: always; margin-top:50px;">
          <h3>Barcode: ${barcode.varCode}</h3>
          <p>Item: ${barcode.itemCode}</p>
          <p>Vendor: ${barcode.venderCode}</p>
          <img src="${barcodeImage}" style="margin-top:20px; width:250px;" />
        </div>
      `;
    });

    const newWin = window.open('', '_blank', 'width=800,height=600');
    if (!newWin) return;

    newWin.document.write(`
      <html>
        <head>
          <title>Print All Barcodes</title>
        </head>
        <body>${printContent}</body>
      </html>
    `);

    newWin.document.close();
    newWin.onload = () => {
      newWin.print();
      newWin.close();
    };
  }

 


delete(barcode: any) {

  console.log('Delete object:', barcode); 
  const id = barcode?.barcodeId;

  if (!id) {
    this.toastr.error('Invalid barcode ID');
    return;
  }

  this.onDelete(id);
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

      this.barcodeService.deleteBarCode(id).subscribe({

        next: (res: any) => {

          if (res && res.status === 1) {

          
            this.toastr.success(
              res.message || 'Barcode deleted successfully',
              'Success'
            );

            this.loadBarcodes(); 

          } else {

            this.toastr.error(
              res?.message || 'Delete failed',
              'Error'
            );
          }
        },

        error: (err) => {

          console.error('Delete error:', err);

          this.toastr.error(
            err?.error?.message || 'Delete failed',
            'Error'
          );
        }

      });

    }

  });
}
}