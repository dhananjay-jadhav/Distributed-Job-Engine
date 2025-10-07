import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class JobsFilter {
  @Field({ nullable: true })
  name?: string;
}
