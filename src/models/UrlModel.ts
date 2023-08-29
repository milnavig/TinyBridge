import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'urls', // Table name in the database
  timestamps: true,  // Adding createdAt and updatedAt fields
})
export class Url extends Model {
  @Column({
    type: DataType.UUID, 
    defaultValue: DataType.UUIDV4, // UUID generation when creating an entry
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true, // Short URL must be unique
  })
  shortUrl!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fullUrl!: string;
}