import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { ServiceOrder, ServiceOrderDocument } from './service-order.schema';
import { CreateBillOfMaterialsItemDto, CreateServiceOrderDto, UpdateServiceOrderDto } from './service-order.dto';

@Injectable()
export class ServiceOrderService {
  constructor(
    @InjectModel(ServiceOrder.name) private serviceOrderModel: Model<ServiceOrderDocument>,
  ) { }

  async create(createServiceOrderDto: CreateServiceOrderDto): Promise<ServiceOrder> {
    try {
      // Calculate total value from bill of materials
      let totalValue = 0;
      if (createServiceOrderDto.billOfMaterials) {
        createServiceOrderDto.billOfMaterials.forEach(item => {
          if (item.rate && item.quantity) {
            item.total = item.rate * item.quantity;
            totalValue += item.total;
          }
        });
      }

      const createdOrder = new this.serviceOrderModel({
        ...createServiceOrderDto,
        totalValue,
      });

      return await createdOrder.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Site ID already exists');
      }
      throw error;
    }
  }

  async findAll(query: any = {}): Promise<ServiceOrder[]> {
    const filter: FilterQuery<ServiceOrderDocument> = {};

    // Add filtering capabilities
    if (query.status) filter.status = query.status;
    if (query.issuedBy) filter.issuedBy = new RegExp(query.issuedBy, 'i');
    if (query.issuedTo) filter.issuedTo = new RegExp(query.issuedTo, 'i');
    if (query.region) filter['locationInfo.region'] = new RegExp(query.region, 'i');
    if (query.siteId) filter['siteDetails.siteId'] = new RegExp(query.siteId, 'i');

    // Date range filtering
    if (query.startDate || query.endDate) {
      filter.serviceOrderDate = {};
      if (query.startDate) filter.serviceOrderDate.$gte = new Date(query.startDate);
      if (query.endDate) filter.serviceOrderDate.$lte = new Date(query.endDate);
    }

    return this.serviceOrderModel
      .find(filter)
      .sort({ serviceOrderDate: -1 })
      .limit(parseInt(query.limit) || 100)
      .skip(parseInt(query.offset) || 0)
      .exec();
  }

  async findOne(id: string): Promise<ServiceOrder> {
    const order = await this.serviceOrderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Service Order with ID ${id} not found`);
    }
    return order;
  }

  async findBySiteId(siteId: string): Promise<ServiceOrder[]> {
    return this.serviceOrderModel
      .find({ 'siteDetails.siteId': siteId })
      .sort({ serviceOrderDate: -1 })
      .exec();
  }

  async update(id: string, updateServiceOrderDto: UpdateServiceOrderDto): Promise<ServiceOrder> {
    // Recalculate total if bill of materials is updated
    if (updateServiceOrderDto.billOfMaterials) {
      let totalValue = 0;
      updateServiceOrderDto.billOfMaterials.forEach(item => {
        if (item.rate && item.quantity) {
          item.total = item.rate * item.quantity;
          totalValue += item.total;
        }
      });
      updateServiceOrderDto['totalValue'] = totalValue;
    }

    const updatedOrder = await this.serviceOrderModel
      .findByIdAndUpdate(id, updateServiceOrderDto, { new: true })
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException(`Service Order with ID ${id} not found`);
    }
    return updatedOrder;
  }

  async updateDesignSummary(id: string, designSummary: Record<string, any>): Promise<ServiceOrder> {
    const updatedOrder = await this.serviceOrderModel
      .findByIdAndUpdate(
        id,
        { $set: { designSummary } },
        { new: true }
      )
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException(`Service Order with ID ${id} not found`);
    }
    return updatedOrder;
  }

  async addBillOfMaterialsItem(id: string, item: CreateBillOfMaterialsItemDto): Promise<ServiceOrder> {
    if (item.rate && item.quantity) {
      item.total = item.rate * item.quantity;
    }

    const updatedOrder = await this.serviceOrderModel
      .findByIdAndUpdate(
        id,
        { $push: { billOfMaterials: item } },
        { new: true }
      )
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException(`Service Order with ID ${id} not found`);
    }

    // Recalculate total value
    const totalValue = updatedOrder.billOfMaterials.reduce((sum, bomItem) => {
      return sum + (bomItem.total || 0);
    }, 0);

    updatedOrder.totalValue = totalValue;
    return updatedOrder.save();
  }

  async approve(id: string, approvalData: { approvedBy: string; approvalComments?: string }): Promise<ServiceOrder> {
    const updatedOrder = await this.serviceOrderModel
      .findByIdAndUpdate(
        id,
        {
          status: 'approved',
          approval: {
            approvedBy: approvalData.approvedBy,
            approvedDate: new Date(),
            approvalComments: approvalData.approvalComments
          }
        },
        { new: true }
      )
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException(`Service Order with ID ${id} not found`);
    }
    return updatedOrder;
  }

  async remove(id: string): Promise<void> {
    const result = await this.serviceOrderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Service Order with ID ${id} not found`);
    }
  }

  async getStatistics(): Promise<any> {
    const stats = await this.serviceOrderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]);

    const regionStats = await this.serviceOrderModel.aggregate([
      {
        $group: {
          _id: '$locationInfo.region',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      statusDistribution: stats,
      regionDistribution: regionStats,
      totalOrders: await this.serviceOrderModel.countDocuments()
    };
  }
}