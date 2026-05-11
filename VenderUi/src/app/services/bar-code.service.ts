import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BarCodeApi } from '../Constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class BarCodeService {

  constructor(private http: HttpClient) { }

  getVendorItems(venderCode: string): Observable<any> {
    const params = new HttpParams().set('venderCode', venderCode);
    return this.http.get(BarCodeApi.getBarCodeItems, { params });
  }
getBarcodes(): Observable<any> {
  return this.http.get(BarCodeApi.GetBarCode);
}
  deleteBarCode(id: number): Observable<any> {
  return this.http.delete(BarCodeApi.deleteBarCode(id));
}
  insertBarCode(request: {
    VenderCode: string,
    ItemCode: string,
    ManufacturingDate: string | Date,
    ExpiryDate: string | Date
  }): Observable<any> {

    return this.http.post<any>(
      BarCodeApi.insertBarCode,
      request
    );
  }
}