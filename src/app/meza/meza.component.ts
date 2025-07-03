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
  selector: 'app-meza',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meza.component.html',
  styleUrl: './meza.component.css'
})
export class MezaComponent implements AfterViewInit {
  expresion: string = '';
  preorden: string = '';
  inorden: string = '';
  postorden: string = '';
  error: string = '';
  variables: string[] = [];
  valoresVars: { [key: string]: any } = {};
  resultadoEvaluacion: string = '';

  constructor(private service: ServicepythonService) {}

  ngAfterViewInit(): void {
    // Si quieres dibujar algo inicial, puedes hacerlo aquí
  }

  obtenerRecorridos() {
    this.error = '';
    this.preorden = this.inorden = this.postorden = '';
    this.variables = [];
    this.valoresVars = {};
    this.resultadoEvaluacion = '';
    // Normaliza la expresión para que cada token esté separado por espacio
    let expresionNormalizada = this.expresion
      .replace(/([\^\*\+\-\/\(\)])/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
    expresionNormalizada = expresionNormalizada.replace(/\( /g, '(').replace(/ \)/g, ')');
    expresionNormalizada = expresionNormalizada.replace(/\s*([\^\*\+\-\/])\s*/g, ' $1 ');
    expresionNormalizada = expresionNormalizada.replace(/\s+/g, ' ').trim();
    console.log('Expresión normalizada enviada al backend:', expresionNormalizada);
    if (!expresionNormalizada) {
      this.error = 'Ingrese una expresión.';
      return;
    }
    this.service.obtenerRecorridos(expresionNormalizada).subscribe({
      next: (res) => {
        this.preorden = res.preorden;
        this.inorden = res.inorden;
        this.postorden = res.postorden;
        this.variables = res.variables || [];
        // Inicializa los valores de las variables en blanco
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
    // Validar que todos los valores estén completos
    for (const v of this.variables) {
      if (this.valoresVars[v] === '' || this.valoresVars[v] === null || isNaN(Number(this.valoresVars[v]))) {
        this.error = `Ingrese un valor numérico para la variable ${v}`;
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

  // --- Visualización con Cytoscape usando mathjs ---
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
      container: document.getElementById('cy'),
      elements: elements,
      layout: {
        name: 'dagre',
        // @ts-ignore
        rankDir: 'TB',
        // @ts-ignore
        nodeSep: 50,
        // @ts-ignore
        edgeSep: 10,
        // @ts-ignore
        rankSep: 100,
        // @ts-ignore
        padding: 30
      },
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            shape: 'ellipse',
            'background-color': '#e8f5e9',
            'border-color': '#2a7be4',
            'border-width': 4,
            width: 90,
            height: 90,
            color: '#2a7be4',
            'font-size': '50px',
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-outline-color': '#ffffff',
            'text-outline-width': 2
          }
        },
        {
          selector: 'edge',
          style: {
            width: 3,
            'line-color': '#a5d6a7',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#a5d6a7',
            'curve-style': 'unbundled-bezier',
            'control-point-step-size': 40
          }
        }
      ]
    });
  }

  convertirANodos(node: any, parentId: string | null = null, elements: any[] = [], idCounter: { id: number } = { id: 0 }): any[] {
    const id = `n${idCounter.id++}`;
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
