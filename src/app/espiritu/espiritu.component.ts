import { Component, AfterViewInit } from '@angular/core';
import { ServicepythonService } from '../servicepython.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import cytoscape from 'cytoscape';
import { parse } from 'mathjs';

@Component({
  selector: 'app-espiritu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './espiritu.component.html',
  styleUrls: ['./espiritu.component.css']
})
export class EspirituComponent implements AfterViewInit {
  expresion: string = '';
  preorden: string = '';
  inorden: string = '';
  postorden: string = '';
  error: string = '';
  variables: string[] = [];
  valoresVars: { [key: string]: any } = {};
  resultadoEvaluacion: string = '';

  constructor(private service: ServicepythonService) {}

  ngAfterViewInit(): void {}

  obtenerRecorridos() {
    this.error = '';
    this.preorden = this.inorden = this.postorden = '';
    this.variables = [];
    this.valoresVars = {};
    this.resultadoEvaluacion = '';
    let expresionNormalizada = this.expresion
      .replace(/([\^\*\+\-\/\(\)])/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
    expresionNormalizada = expresionNormalizada.replace(/\( /g, '(').replace(/ \)/g, ')');
    expresionNormalizada = expresionNormalizada.replace(/\s*([\^\*\+\-\/])\s*/g, ' $1 ');
    expresionNormalizada = expresionNormalizada.replace(/\s+/g, ' ').trim();
    if (!expresionNormalizada) {
      this.error = 'Por favor ingresa una expresión válida.';
      return;
    }
    this.service.obtenerRecorridos(expresionNormalizada).subscribe({
      next: (res) => {
        this.preorden = res.preorden;
        this.inorden = res.inorden;
        this.postorden = res.postorden;
        this.variables = res.variables || [];
        this.valoresVars = {};
        this.variables.forEach(v => this.valoresVars[v] = '');
        setTimeout(() => this.dibujarArbolCytoscape(), 0);
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al procesar la expresión';
      }
    });
  }

  evaluarExpresion() {
    this.resultadoEvaluacion = '';
    for (const v of this.variables) {
      if (this.valoresVars[v] === '' || this.valoresVars[v] === null || isNaN(Number(this.valoresVars[v]))) {
        this.error = `Falta valor para la variable ${v}`;
        return;
      }
    }
    this.error = '';
    this.service.evaluarExpresion(this.expresion, this.valoresVars).subscribe({
      next: (res) => {
        this.resultadoEvaluacion = `Resultado: ${res.resultado}`;
      },
      error: (err) => {
        this.resultadoEvaluacion = '';
        this.error = err.error?.error || 'Error al evaluar la expresión';
      }
    });
  }

  dibujarArbolCytoscape() {
    if (!this.expresion) return;
    let parsed;
    try {
      parsed = parse(this.expresion);
    } catch (e: any) {
      this.error = 'Expresión inválida: ' + e.message;
      return;
    }
    const elements = this.convertirANodos(parsed);
    cytoscape({
      container: document.getElementById('cy-espiritu'),
      elements: elements,
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 50
      },
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            shape: 'ellipse',
            'background-color': '#f8f6f0', // blanco perla
            'border-color': '#111', // negro
            'border-width': 7,
            width: 100,
            height: 100,
            color: '#111',
            'font-size': '50px',
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-outline-color': '#fff',
            'text-outline-width': 3
          }
        },
        {
          selector: 'edge',
          style: {
            width: 6,
            'line-color': '#111',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#f8f6f0',
            'curve-style': 'bezier',
            'control-point-step-size': 70
          }
        }
      ]
    });
  }

  convertirANodos(node: any, parentId: string | null = null, elements: any[] = [], idCounter: { id: number } = { id: 0 }): any[] {
    const id = `e${idCounter.id++}`;
    const label = node.name || node.op || node.fn || node.value || '?';
    elements.push({ data: { id, label } });
    if (parentId) {
      elements.push({ data: { source: parentId, target: id } });
    }
    if (node.args) {
      node.args.forEach((child: any) => this.convertirANodos(child, id, elements, idCounter));
    }
    return elements;
  }

  actualizarGrafico() {
    this.dibujarArbolCytoscape();
  }
}
