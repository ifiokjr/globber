export class GlobError extends AggregateError {
  static wrap(error: unknown, root: string): GlobError {
    if (GlobError.is<GlobError>(error)) {
      return error;
    }

    const [message, stack, cause] = error instanceof Error
      ? [`${error.message} for path "${root}"`, error.stack, error.cause]
      : [`[non-error thrown] for path "${root}"`];
    const globError = new GlobError(root, message, [error]);

    globError.stack = stack;
    globError.cause = cause;

    return globError;
  }

  static is<Error extends GlobError>(value: unknown): value is Error {
    return value instanceof this;
  }

  /**
   * The root which caused this error to be thrown.
   */
  root: string;

  constructor(root: string, message: string, errors: unknown[] = []) {
    super(errors, message);
    this.root = root;
  }
}
