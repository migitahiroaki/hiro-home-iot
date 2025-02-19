export class NameUtil {
  public static generateName(
    projectName: string,
    resourceType: string,
    suffix: string
  ): string {
    return `${projectName}-${resourceType}-${suffix}`;
  }
}
