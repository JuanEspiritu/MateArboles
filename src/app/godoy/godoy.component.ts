import { Component, AfterViewInit } from '@angular/core';
import { ServicepythonService } from '../servicepython.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// @ts-ignore
import cytoscapeDagre from 'cytoscape-dagre';
import cytoscape from 'cytoscape';
import { parse } from 'mathjs';

cytoscape.use(cytoscapeDagre);

@Component({
  selector: 'app-godoy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './godoy.component.html',
  styleUrl: './godoy.component.css'
})
export class GodoyComponent implements AfterViewInit {
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
      this.error = 'Por favor ingrese una expresión.';
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
        this.error = `Ingrese un valor válido para la variable ${v}`;
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
      container: document.getElementById('cy-godoy'),
      elements: elements,
      layout: {
        name: 'breadthfirst',
        // @ts-ignore
        directed: true,
        // @ts-ignore
        padding: 40
      },
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            shape: 'round-rectangle',
            'background-color': '#c8e6c9', // verde claro
            'border-color': '#388e3c',    // verde oscuro
            'border-width': 6,
            width: 110,
            height: 65,
            color: '#1b5e20',             // texto verde muy oscuro
            'font-size': '38px',
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-outline-color': '#e8f5e9',
            'text-outline-width': 2
          }
        },
        {
          selector: 'edge',
          style: {
            width: 5,
            'line-color': '#43a047', // verde medio
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#388e3c',
            'curve-style': 'bezier',
            'control-point-step-size': 60
          }
        }
      ]
    });
  }

  convertirANodos(node: any, parentId: string | null = null, elements: any[] = [], idCounter: { id: number } = { id: 0 }): any[] {
    const id = `g${idCounter.id++}`;
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
