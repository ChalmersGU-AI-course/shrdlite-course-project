class Set<T> {

  private items: T[] = [];

  add(item: T): void {
    if (this.has(item)) throw "Duplicate item";
    this.items.push(item);
  }

  delete(item: T) : void {
    var index = this.items.indexOf(item);
    if (index > -1) this.items.splice(index, 1);
  }

  has(item: T): boolean {
    return this.items.indexOf(item) > -1;
  }

  size(): number {
    return this.items.length;
  }

  toArray(): T[] {
    return this.items.slice(0);
  }
}

export = Set;
