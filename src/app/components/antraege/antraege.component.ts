import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AntragService, AntragEintrag } from '../../services/antrag.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-antraege',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TableModule, TagModule, TooltipModule],
  templateUrl: './antraege.component.html',
  styleUrls: ['./antraege.component.scss']
})
export class AntraeegeComponent implements OnInit {
  antraege: AntragEintrag[] = [];

  constructor(private antragService: AntragService, public auth: AuthService) {}

  ngOnInit(): void {
    this.antraege = this.antragService.getAntraege();
  }
}
