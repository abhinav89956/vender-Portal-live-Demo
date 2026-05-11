import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemApi } from '../Constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor(private http: HttpClient) { }

  getAllItems(
    searchItemCode: string = '', 
    pageNumber: number = 1, 
    pageSize: number = 10
  ): Observable<any> {
    let params = new HttpParams()
      .set('searchItemCode', searchItemCode)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get(ItemApi.getItems, { params });
  }


  addItem(data: any): Observable<any> {
    return this.http.post(ItemApi.addItem, data);
  }


  updateItem(data: any): Observable<any> {
    return this.http.post(ItemApi.updateItem, data);
  }


  deleteItem(id: number): Observable<any> {
    return this.http.delete(ItemApi.deleteItem(id));
  }
}
