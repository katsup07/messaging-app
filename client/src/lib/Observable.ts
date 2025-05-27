// Simple Observable implementation for tracking data changes
export type Observer<T> = (data: T) => void;

export class Observable<T> {
  // List of observer callbacks that will be called when data is emitted
  private observers: Observer<T>[] = [];

  subscribe(observer: Observer<T>): () => void {
    this.observers.push(observer);
    
    // Return unsubscribe function
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  notify(data: T): void {
    this.observers.forEach(observer => observer(data));
  }

  getObserverCount(): number {
    return this.observers.length;
  }
}
