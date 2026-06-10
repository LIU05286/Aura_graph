declare module "d3-force-3d" {
  export interface SimulationNode {
    x?: number;
    y?: number;
    z?: number;
    vx?: number;
    vy?: number;
    vz?: number;
    fx?: number | null;
    fy?: number | null;
    fz?: number | null;
    index?: number;
  }

  export interface Force {
    (alpha?: number): void;
    initialize?: (nodes: unknown[]) => void;
  }

  export interface Simulation<N> {
    tick(iterations?: number): this;
    stop(): this;
    restart(): this;
    nodes(): N[];
    nodes(nodes: N[]): this;
    alpha(alpha: number): this;
    alphaDecay(decay: number): this;
    alphaMin(min: number): this;
    force(name: string): Force | undefined;
    force(name: string, force: Force | null): this;
    on(typenames: string, listener: (() => void) | null): this;
  }

  export function forceSimulation<N extends SimulationNode>(
    nodes?: N[],
    numDimensions?: number
  ): Simulation<N>;

  export interface ManyBodyForce extends Force {
    strength(strength: number): this;
  }
  export function forceManyBody(): ManyBodyForce;

  export interface PositioningForce extends Force {
    strength(strength: number): this;
  }
  export function forceX(x?: number): PositioningForce;
  export function forceY(y?: number): PositioningForce;
  export function forceZ(z?: number): PositioningForce;

  export interface LinkForce extends Force {
    // 第三方库无官方类型,这里用 any 是声明文件里的标准妥协
    id(accessor: (node: any) => string): this;
    distance(distance: number): this;
    strength(strength: number): this;
    links(links: any[]): this;
  }
  export function forceLink<L>(links?: L[]): LinkForce;

  export interface CenterForce extends Force {
    strength(strength: number): this;
  }
  export function forceCenter(x?: number, y?: number, z?: number): CenterForce;

  export interface CollideForce extends Force {
    radius(radius: number): this;
    strength(strength: number): this;
  }
  export function forceCollide(radius?: number): CollideForce;
}
