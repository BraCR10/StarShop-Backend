import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { Express } from "express"
import { OffersService } from "../services/offers.service"
import { OfferAttachmentService } from "../services/offer-attachment.service"
import { CreateOfferDto } from "../dto/create-offer.dto"
import { UpdateOfferDto } from "../dto/update-offer.dto"
import { UploadAttachmentDto } from "../dto/upload-attachment.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"
import { cloudinaryUpload } from "../../files/config/cloudinary.config"
import { AuthRequest } from "@/modules/wishlist/common/types/auth-request.type"
import { Role } from "@/types/role"

@Controller("offers")
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly offerAttachmentService: OfferAttachmentService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  create(createOfferDto: CreateOfferDto, @Request() req: AuthRequest) {
    return this.offersService.create(createOfferDto, String(req.user.id))
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.offersService.findAll(page, limit)
  }

  @Get("my-offers")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  findMyOffers(
    @Request() req: AuthRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.offersService.findBySeller(String(req.user.id), page, limit)
  }

  @Get('buyer-request/:buyerRequestId')
  findByBuyerRequest(@Param('buyerRequestId') buyerRequestId: string) {
    return this.offersService.findByBuyerRequest(buyerRequestId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  update(@Param('id') id: string, updateOfferDto: UpdateOfferDto, @Request() req: AuthRequest) {
    return this.offersService.update(id, updateOfferDto, String(req.user.id))
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.offersService.remove(id, String(req.user.id))
  }

  // Attachment endpoints
  @Post(":id/attachments")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  async uploadAttachment(
    @Param('id') offerId: string,
    @UploadedFile() file: Express.Multer.File,
    uploadAttachmentDto: UploadAttachmentDto,
    @Request() req: AuthRequest,
  ) {
    if (!file) {
      throw new BadRequestException("File is required")
    }

    return this.offerAttachmentService.uploadAttachment(offerId, file, String(req.user.id), "cloudinary")
  }

  @Get(':id/attachments')
  getAttachments(@Param('id') offerId: string) {
    return this.offerAttachmentService.getOfferAttachments(offerId);
  }

  @Delete("attachments/:attachmentId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  deleteAttachment(@Param('attachmentId') attachmentId: string, @Request() req: AuthRequest) {
    return this.offerAttachmentService.deleteAttachment(attachmentId, String(req.user.id))
  }
}
