import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsService } from '@app/services/ggmap/google-maps.service';

declare var google: any; 

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-search.component.html'
})
export class LocationSearchComponent implements OnInit {
  @Output() back = new EventEmitter<void>();
  @Output() locationSelected = new EventEmitter<any>();

  searchQuery: string = '';
  predictions: any[] = [];
  autocompleteService: any;

  constructor(private googleMapsService: GoogleMapsService) {}

  ngOnInit() {
    this.googleMapsService.loadGoogleMaps().then(() => {
      this.autocompleteService = new google.maps.places.AutocompleteService();
    });
  }

  onSearchChange() {
    if (!this.searchQuery.trim()) {
      this.predictions = [];
      return;
    }

    // Gọi API của Google để lấy gợi ý
    if (this.autocompleteService) {
      this.autocompleteService.getPlacePredictions(
        { input: this.searchQuery },
        (predictions: any[], status: any) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            this.predictions = predictions;
          } else {
            this.predictions = [];
          }
        }
      );
    }
  }

  selectPlace(prediction: any) {
    this.locationSelected.emit({
      name: prediction.structured_formatting.main_text,
      address: prediction.structured_formatting.secondary_text,
      placeId: prediction.place_id,
      type: 'PLACE'
    });
  }
}