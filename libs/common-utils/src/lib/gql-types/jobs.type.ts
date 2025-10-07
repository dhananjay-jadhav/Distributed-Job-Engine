import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Job')
export class JobType {
  @Field()
  name!: string;

  @Field()
  description!: string;
}
