import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {

  public carouselTileItems: Array<any> = [
  ];
  @ViewChild('myCarousel') myCarousel: NguCarousel<any>;
  public carouselTile: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 1, lg: 1, xl:1, all: 0 },
    slide: 1,
    speed: 250,
    point: {
      visible: true
    },
    load: 1,
    velocity: 0,
    touch: true,
    easing: 'cubic-bezier(0, 0, 0.2, 1)'
  };

  activeImageIndex: number;

  constructor(private dialogRef: MatDialogRef<CarouselComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef) {
      this.activeImageIndex = data.imageIndex;
      this.carouselTileItems = data.images;
     }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.myCarousel.moveTo(this.activeImageIndex);
    this.cdr.detectChanges();
  }

  closeCarousel() {
    this.dialogRef.close();
  }
}
