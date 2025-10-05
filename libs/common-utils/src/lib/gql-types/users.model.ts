import { AbstractModel } from './abstract.model';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('User')
export class UserType extends AbstractModel {
  @Field()
  email!: string;
}
