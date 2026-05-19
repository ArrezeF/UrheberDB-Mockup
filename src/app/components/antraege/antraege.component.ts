import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AntragService, AntragEintrag } from '../../services/antrag.service';

@Component({
  selector: 'app-antraege',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TableModule, TagModule],
  templateUrl: './antraege.component.html',
  styleUrls: ['./antraege.component.scss']
})
export class AntraeegeComponent implements OnInit {
  antraege: AntragEintrag[] = [];

  constructor(private antragService: AntragService) {}

  ngOnInit(): void {
    this.antraege = this.antragService.getAntraege();
  }
}
