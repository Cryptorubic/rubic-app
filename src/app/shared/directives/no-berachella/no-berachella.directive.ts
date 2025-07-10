import { Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';

@Directive({
  selector: '[noBerachella]'
})
export class NoBerachellaDirective<T> implements OnInit {
  constructor(
    private readonly templateRef: TemplateRef<T>,
    private readonly viewContainer: ViewContainerRef,
    private readonly queryParamsService: QueryParamsService
  ) {}

  ngOnInit() {
    if (!this.queryParamsService.isBerachella) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
