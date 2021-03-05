import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { WebsocketService } from 'src/app/services/websocket.service';
import { BisqApiService } from '../bisq-api.service';

@Component({
  selector: 'app-bisq-dashboard',
  templateUrl: './bisq-dashboard.component.html',
  styleUrls: ['./bisq-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BisqDashboardComponent implements OnInit {
  tickers$: Observable<any>;

  constructor(
    private websocketService: WebsocketService,
    private bisqApiService: BisqApiService,
  ) { }

  ngOnInit(): void {
    this.websocketService.want(['blocks']);

    this.tickers$ = combineLatest([
      this.bisqApiService.getMarketsTicker$(),
      this.bisqApiService.getMarkets$(),
      this.bisqApiService.getMarket24hVolumes$(),
    ])
    .pipe(
      map(([tickers, markets, volumes]) => {
        const newTickers = [];
        for (const t in tickers) {
          tickers[t].pair_url = t;
          tickers[t].pair = t.replace('_', '/').toUpperCase();
          tickers[t].market = markets[t];
          tickers[t].volume = volumes[t];
          newTickers.push(tickers[t]);
        }

        newTickers.sort((a, b) => (b.volume && b.volume.volume || 0) - (a.volume && a.volume.volume || 0));

        return newTickers;
      })
    );
  }

  trackByFn(index: number) {
    return index;
  }

}
