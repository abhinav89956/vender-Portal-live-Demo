import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { VendorApi } from '../Constants/api-constants';

export interface AssignDto {
  itemCode: string;  
  venderCode: string; 
}

@Injectable({
  providedIn: 'root'
})
export class VenderService {

  constructor(private http: HttpClient) { }


  getAllVendors(
    searchVenderCode: string = '',
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<any> {

    let params = new HttpParams()
      .set('searchVenderCode', searchVenderCode)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get(VendorApi.getItems, { params })
      .pipe(catchError(this.handleError));
  }

  
  addVendor(data: any): Observable<any> {
    return this.http.post(VendorApi.addItem, data)
      .pipe(catchError(this.handleError));
  }


  updateVendor(data: any): Observable<any> {
    return this.http.put(VendorApi.updateItem, data)
      .pipe(catchError(this.handleError));
  }

 
  deleteVendor(id: number): Observable<any> {
    return this.http.delete(VendorApi.deleteItem(id))
      .pipe(catchError(this.handleError));
  }


  assignItems(payload: AssignDto): Observable<any> {
    return this.http.post(VendorApi.assignItems, payload)
      .pipe(catchError(this.handleError));
  }

 
  unAssignItems(payload: AssignDto): Observable<any> {
    return this.http.post(VendorApi.unAssignItems, payload)
      .pipe(catchError(this.handleError));
  }


  private handleError(error: any) {
    console.error('API Error:', error);

    return throwError(() => ({
      Status: 0,
      Message: error?.error?.Message || 'Server Error'
    }));
  }
}
