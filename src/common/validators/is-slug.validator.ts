import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsSlugConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return typeof text === 'string' && slugRegex.test(text);
  }

  defaultMessage() {
    return 'Text ($value) is not a valid slug';
  }
}

export function IsSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSlugConstraint,
    });
  };
}
