import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AfterViewInit, Component, HostBinding } from '@angular/core';
import { fromEvent } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  share,
  throttleTime,
} from 'rxjs/operators';

enum VisibilityState {
  Visible = 'visible',
  Hidden = 'hidden',
}

enum Direction {
  Up = 'Up',
  Down = 'Down',
}

@Component({
  selector: 'app-sticky-header',
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        position: fixed;
        top: 0;s
        width: 100%;
      }
    `,
  ],
  animations: [
    trigger('toggle', [
      state(
        VisibilityState.Hidden,
        // style({ opacity: 0, transform: 'translateY(-100%)' })
        style({
          height: '40px',
          'font-size': '1.5rem',
        })
      ),
      state(
        VisibilityState.Visible,
        style({
          opacity: 1,
          transform: 'translateY(0)',
          'font-size': '2rem',
        })
      ),
      transition('* => *', animate('50ms ease-in')),
    ]),
  ],
})
export class StickyHeaderComponent implements AfterViewInit {
  private isVisible = true;

  @HostBinding('@toggle')
  get toggledd(): VisibilityState {
    return this.isVisible ? VisibilityState.Visible : VisibilityState.Hidden;
  }

  ngAfterViewInit() {
    const scroll$ = fromEvent(window, 'scroll').pipe(
      throttleTime(10),
      map(() => window.pageYOffset),
      pairwise(),
      map(([y1, y2]): Direction => (y2 < y1 ? Direction.Up : Direction.Down)),
      distinctUntilChanged(),
      share()
    );

    const goingUp$ = scroll$.pipe(
      filter((direction) => direction === Direction.Up)
    );

    const goingDown$ = scroll$.pipe(
      filter((direction) => direction === Direction.Down)
    );

    goingUp$.subscribe(() => (this.isVisible = true));
    goingDown$.subscribe(() => (this.isVisible = false));
  }
}
