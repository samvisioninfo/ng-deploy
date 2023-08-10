import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { allProductsEntry, allProductsFilter, Filter, LookupEntry, Product } from '../shared/shared.model';
import { DataService } from '../shared/data.service';
import { Options } from '@angular-slider/ngx-slider';
import { ActivatedRoute, Router } from '@angular/router';

export interface Card {
  image: string;
  title: string;
  frag: string;
  state: string;
  price: string;
}

const DATA: Card[] = [
  {
    image: '../../assets/images/montipora.JPG',
    title: 'Montipora',
    frag: 'New',
    state: 'Melbourne, Vic',
    price: 'Price: $180'
  },
  {
    image: '../../assets/images/acropora.jpg',
    title: 'Acropora',
    frag: 'Fresh',
    state: 'Melbourne, Vic',
    price: 'Price: $250'
  },
  {
    image: '../../assets/images/pavona.jpg',
    title: 'Pavona',
    frag: 'Seasoned',
    state: 'Melbourne, Vic',
    price: 'Price: $40'
  },
  {
    image: '../../assets/images/Alveopora.jpg',
    title: 'Alveopora',
    frag: 'Fresh',
    state: 'Melbourne, Vic',
    price: 'Price: $80'
  },
  {
    image: '../../assets/images/Alveopora.jpg',
    title: 'Alveopora',
    frag: 'Fresh',
    state: 'Melbourne, Vic',
    price: 'Price: $80'
  },
  {
    image: '../../assets/images/pavona.jpg',
    title: 'Pavona',
    frag: 'Seasoned',
    state: 'Melbourne, Vic',
    price: 'Price: $40'
  },
  {
    image: '../../assets/images/acropora.jpg',
    title: 'Acropora',
    frag: 'Fresh',
    state: 'Melbourne, Vic',
    price: 'Price: $250'
  },
  {
    image: '../../assets/images/montipora.JPG',
    title: 'Montipora',
    frag: 'New',
    state: 'Melbourne, Vic',
    price: 'Price: $180'
  },
  {
    image: '../../assets/images/montipora.JPG',
    title: 'Montipora',
    frag: 'New',
    state: 'Melbourne, Vic',
    price: 'Price: $180'
  },
  {
    image: '../../assets/images/acropora.jpg',
    title: 'Acropora',
    frag: 'Fresh',
    state: 'Melbourne, Vic',
    price: 'Price: $250'
  },
  {
    image: '../../assets/images/pavona.jpg',
    title: 'Pavona',
    frag: 'Seasoned',
    state: 'Melbourne, Vic',
    price: 'Price: $40'
  },
  {
    image: '../../assets/images/Alveopora.jpg',
    title: 'Alveopora',
    frag: 'Fresh',
    state: 'Melbourne, Vic',
    price: 'Price: $80'
  },
  {
    image: '../../assets/images/Alveopora.jpg',
    title: 'Alveopora',
    frag: 'Fresh',
    state: 'Melbourne, Vic',
    price: 'Price: $80'
  },
  {
    image: '../../assets/images/pavona.jpg',
    title: 'Pavona',
    frag: 'Seasoned',
    state: 'Melbourne, Vic',
    price: 'Price: $40'
  },
  {
    image: '../../assets/images/acropora.jpg',
    title: 'Acropora',
    frag: 'Fresh',
    state: 'Melbourne, Vic',
    price: 'Price: $250'
  },
  {
    image: '../../assets/images/montipora.JPG',
    title: 'Montipora',
    frag: 'New',
    state: 'Melbourne, Vic',
    price: 'Price: $180'
  },
];

@Component({
  selector: 'app-all-listings',
  templateUrl: './all-listings.component.html',
  styleUrls: ['./all-listings.component.scss']
})
export class AllListingsComponent implements OnInit, OnDestroy {

  public _unsubscribeAll: Subject<void> = new Subject();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  obs: Observable<any>;
  dataSource: MatTableDataSource<Product> = new MatTableDataSource<Product>();
  productList: Array<Product>;

  filterGroup: FormGroup;
  filterObj: allProductsFilter = new allProductsFilter();
  categories = ['All','Acropora','Anemones','Hammers','Leather','Leptoseria','Gonipora','Favia','Duncan','Cyphastrea','Chalice','Blasto','Birdnest'];
  states = ['All','Queensland','Victoria','New South Wales','Western Australia','South Australia','Northern Territory','Australian capital Territory','Tasmania'];
  frags = ['All','Fresh','New','Seasoned'];

  itemSpecies: Array<LookupEntry> = [];
  itemStates: Array<LookupEntry> = [];
  coralGroups: Array<LookupEntry> = [];

  priceRangeMin: number = 500;
  priceRangeMax: number = 3500;
  options: Options = {
    floor: 100,
    ceil: 10000
  };

  showPageSpinner: boolean;
  totalCount: number;
  pageSize: 10;
  paginatorOptions: Array<number>;
  queryParamsChecked: boolean;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _dataService: DataService,
    private _router: Router,
    private _route: ActivatedRoute,

    ) {
    this.filterGroup = this._formBuilder.group({
      groupId: new FormControl(''),
      category: new FormControl(''),
      state: new FormControl(''),
      sort: new FormControl(''),
    })
  }

  ngOnInit(): void {
    this.paginatorOptions = [5, 10, 25];

    this.filterObj.pageIndex = 1;
    this.filterObj.pageSize = 10;
    this.getLookups();
    this.subscribeToFilters();
    this.checkQueryParams()

    // this.changeDetectorRef.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.obs = this.dataSource.connect();
  }

  checkQueryParams() {
    this._route.queryParams.subscribe(params => {
      if (!this.queryParamsChecked) {
        if (params['groupId'] && params['categoryId']) {
          this.filterObj.groupId = Number(params['groupId']);
          this.filterObj.coralSpecies = Number(params['categoryId']);
          this.getCoralSpecies(this.filterObj.groupId);
        } else {
          this.getCoralSpecies(null);
        }
        if (params['state']) {
          this.filterObj.state = params['state'];
        }
        if (params['sort']) {
          this.filterObj.sortColumn = params['sort'];
          this.filterGroup.get('sort').setValue(this.filterObj.sortColumn);
        }
        this.queryParamsChecked = true;
        this.getAllListingProducts();
      }
    })
  }


  subscribeToFilters() {
    this.filterGroup.get('category').valueChanges.subscribe(
      data => {
        if (data && data != this.filterObj.coralSpecies) {
          this.filterObj.coralSpecies = Number(data);
          if (!this.filterObj.groupId) {
            let entry = this.itemSpecies.find(el => el.value === data);
            this.filterObj.groupId = entry.parentId;
            this.filterGroup.get('groupId').setValue(this.filterObj.groupId)
          }
          this.setQueryParams();
          this.getAllListingProducts();
        }
      }
    )

    this.filterGroup.get('state').valueChanges.subscribe(
      data => {
        if (data && data != this.filterObj.state) {
          this.filterObj.state = data;
          this.setQueryParams();
          this.getAllListingProducts();
        }
      }
    )

    this.filterGroup.get('sort').valueChanges.subscribe(
      data => {
        if (data && data != this.filterObj.sortColumn) {
          this.filterObj.sortColumn = data;
          this.setQueryParams();
          this.getAllListingProducts();
        }
      }
    )

    this.filterGroup.get('groupId').valueChanges.subscribe(
      data => {
        if (data && data != this.filterObj.groupId) {
          this.filterObj.groupId = data;

          this.filterObj.coralSpecies = null;
          this.filterGroup.get('category').setValue(null);
          this.getCoralSpecies(data);
          this.setQueryParams();
          this.getAllListingProducts();
        }
      }
    )
  }

  setQueryParams() {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {
        categoryId: this.filterObj.coralSpecies,
        state: this.filterObj.state,
        sort: this.filterObj.sortColumn,
        groupId: this.filterObj.groupId,
      },
      queryParamsHandling: 'merge',
    })
  }

  getLookups(){
    this._dataService.getListingLookups('APP_STATE').pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        this.itemStates = data;
        if (this.filterObj.state) {
          this.filterGroup.get('state').setValue(this.filterObj.state);
        }
      }
    );

    this._dataService.getListingLookups('CORAL_GROUP').pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        this.coralGroups = data;
        if (this.filterObj.groupId) {
          this.filterGroup.get('groupId').setValue(this.filterObj.groupId);
        }
      }
    );
  }

  getCoralSpecies(groupId: any) {
    let val = groupId ? groupId : this.filterGroup.get('groupId').value ? this.filterGroup.get('groupId').value : null;
    if (groupId) {
      this.filterGroup.get('groupId').setValue(groupId);
    }
    this.filterObj.groupId = val;

    this._dataService.getCoralSpeciesLookup(val).pipe(takeUntil(this._unsubscribeAll)).subscribe(
      data => {
        this.itemSpecies = data;
        this.itemSpecies.forEach(el => {
          el.parentId = Number(el.parentId);
        })
        setTimeout(() => {
          if (this.filterObj.coralSpecies) {
            this.filterGroup.get('category').setValue(this.filterObj.coralSpecies);
          }
        }, 500)

        this.setQueryParams();
      }
    )
  }

  getAllListingProducts() {
    this.showPageSpinner = true;
    this._dataService.getAllListingProducts(this.filterObj).pipe(takeUntil(this._unsubscribeAll)).subscribe(
      (data: any) => {
        this.productList = data.data;
        this.totalCount = data.totalRecords;
        this.showPageSpinner = false;
        this.productList.forEach(element => {
          element.productImages = element.productImages ? JSON.parse(element.productImages) : [];
        })

        if (this.totalCount < 10) {
          this.paginatorOptions = [5, 10];
        }

        if (this.totalCount > 10 && this.totalCount < 25) {
          this.paginatorOptions = [5, 10, 25];
        }

        if (this.totalCount > 25 && this.totalCount < 50) {
          this.paginatorOptions = [5, 10, 25, 50];
        }

        if (this.totalCount > 50 && this.totalCount < 100) {
          this.paginatorOptions = [5, 10, 50, 100];
        }

        if (this.totalCount > 100) {
          this.paginatorOptions = [5, 10, 50, 100, this.totalCount];
        }
      },
      error => {
        this.showPageSpinner = false;
      }
    )
  }

  paginatorChanged($event) {
    this.filterObj.pageIndex = $event.pageIndex + 1;
    this.filterObj.pageSize = $event.pageSize;
    this.getAllListingProducts();
  }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    return `${value}`;
  }

  showDetails(p) {
    this._router.navigate(
      ['/user/listing-details'],
      { queryParams: { productId: `${p.productId}`} }
    );
  }

  resetFilters() {
    this.filterGroup.reset();
    this.filterObj.coralSpecies = null;
    this.filterObj.groupId = null;
    this.filterObj.state = null;
    this.filterObj.sortColumn = null;
    this.getAllListingProducts();
    this.setQueryParams();
  }


  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
