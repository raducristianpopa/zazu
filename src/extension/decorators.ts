export function NOT_IMPLEMENTED(): MethodDecorator {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const className = target.constructor.name !== "Function" ? target.constructor.name + "." : "";
            console.log(`Calling: ${className}${String(propertyKey)}`);

            const result = originalMethod.apply(this, args);
            return result;
        };
    };
}
