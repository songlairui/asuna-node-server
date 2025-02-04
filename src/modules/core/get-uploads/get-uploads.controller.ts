// tslint:disable:max-line-length
import { Controller, Get, Param, Query, Res, UseInterceptors } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { Response } from 'express';
import { r } from '../../common/helpers';
import { ConfigKeys, configLoader } from '../../config';
import { ControllerLoggerInterceptor, LoggerFactory } from '../../common/logger';
import { AsunaContext } from '../context';
import { FinderHelper } from '../finder';
import { JpegPipe, JpegPipeOptions } from '../image/jpeg.pipe';
import { ThumbnailPipe, ThumbnailPipeOptions } from '../image/thumbnail.pipe';

const logger = LoggerFactory.getLogger('GetUploadsController');

@ApiUseTags('core')
@UseInterceptors(ControllerLoggerInterceptor)
@Controller('uploads')
export class GetUploadsController {
  private context = AsunaContext.instance;

  // TODO not finished yet
  @Get('options')
  async getOptions() {
    return {
      image: { storage: configLoader.loadConfig(ConfigKeys.IMAGES_STORAGE) },
      video: { storage: configLoader.loadConfig(ConfigKeys.VIDEOS_STORAGE) },
      file: { storage: configLoader.loadConfig(ConfigKeys.FILES_STORAGE) },
    };
  }

  /**
   * 1. /images/2018/4/****.png
   * 1.1 /images/2018/4/****.png?thumbnail/<Width>x<Height>
   * 1.2 /images/2018/4/****.png?thumbnail/<Width>x<Height>_[cover|contain|fill|inside|outside]
   * 1.3 /images/2018/4/****.jpeg?jpeg/75
   * 1.4 /images/2018/4/****.jpeg?jpeg/80_progressive
   * 1.5 /images/2018/4/****.jpeg?jpeg/80_progressive&thumbnail/<Width>x<Height>_[cover|contain|fill|inside|outside]
   * 2. /images/****.png?prefix=2018/4
   * @param bucket
   * @param filename
   * @param internal 内部地址
   * @param thumbnailConfig
   * @param jpegConfig
   * @param res
   */
  @Get(':bucket/*')
  async getUploads(
    @Param('bucket') bucket: string,
    @Param('0') filename: string,
    @Query('internal') internal: boolean,
    @Query(ThumbnailPipe) thumbnailConfig: ThumbnailPipeOptions,
    @Query(JpegPipe) jpegConfig: JpegPipeOptions,
    @Res() res: Response,
  ) {
    logger.debug(`get [${bucket}] file [${filename}] by ${r({ thumbnailConfig, jpegConfig, internal })}`);
    const url = await this.context.defaultStorageEngine.resolveUrl({
      filename,
      bucket,
      thumbnailConfig,
      jpegConfig,
      resolver: url => FinderHelper.getUrl({ type: 'assets', path: url, internal }),
    });
    logger.debug(`resolved url is ${url}`);
    return res.redirect(url);
  }

  // /**
  //  * 1. /images/2018/4/****.png
  //  * 1.1 /images/2018/4/****.png?thumbnail/<Width>x<Height>
  //  * 1.2 /images/2018/4/****.png?thumbnail/<Width>x<Height>_[cover|contain|fill|inside|outside]
  //  * 1.3 /images/2018/4/****.jpeg?jpeg/75
  //  * 1.4 /images/2018/4/****.jpeg?jpeg/80_progressive
  //  * 1.5 /images/2018/4/****.jpeg?jpeg/80_progressive&thumbnail/<Width>x<Height>_[cover|contain|fill|inside|outside]
  //  * 2. /images/****.png?prefix=2018/4
  //  * @param {string} filename
  //  * @param thumbnailConfig
  //  * @param jpegConfig
  //  * @param {string} prefix
  //  * @param {string} bucket
  //  * @param res
  //  * @returns {Promise<void>}
  //  */
  // @Get('images/*')
  // async getImage(
  //   @Param('0') filename: string,
  //   @Query(ThumbnailPipe) thumbnailConfig: ThumbnailPipeOptions,
  //   @Query(JpegPipe) jpegConfig: JpegPipeOptions,
  //   @Query('prefix') prefix: string = '',
  //   @Query('bucket') bucket: string = 'default',
  //   @Res() res: Response,
  // ) {
  //   const fullFilePath = join(this.context.uploadPath, bucket, prefix, filename);
  //   if (fullFilePath.startsWith(this.context.uploadPath)) {
  //     return this.context.defaultStorageEngine.resolveUrl(
  //       { filename, bucket, prefix, thumbnailConfig, jpegConfig },
  //       res,
  //     );
  //   }
  // }
  //
  // @Get('videos/!*')
  // async getVideo(
  //   @Param('0') filename: string,
  //   @Query('prefix') prefix: string = '',
  //   @Query('bucket') bucket: string = 'videos',
  //   @Res() res: Response,
  // ) {
  //   const fullFilePath = join(this.context.uploadPath, bucket, prefix, filename);
  //   if (fullFilePath.startsWith(this.context.uploadPath)) {
  //     logger.log(`check if file '${fullFilePath}' exists`);
  //     if (!fs.existsSync(fullFilePath)) {
  //       throw new NotFoundException();
  //     }
  //     res.sendFile(fullFilePath);
  //   } else {
  //     res.send();
  //   }
  // }
  //
  // @Get('attaches/!*')
  // async getAttaches(
  //   @Param('0') filename: string,
  //   @Query('prefix') prefix: string = '',
  //   @Query('bucket') bucket: string = 'attaches',
  //   @Res() res: Response,
  // ) {
  //   const fullFilePath = join(this.context.uploadPath, bucket, prefix, filename);
  //   if (fullFilePath.startsWith(this.context.uploadPath)) {
  //     logger.log(`check if file '${fullFilePath}' exists`);
  //     if (!fs.existsSync(fullFilePath)) {
  //       throw new NotFoundException();
  //     }
  //     res.sendFile(fullFilePath);
  //   } else {
  //     res.send();
  //   }
  // }
  //
  // @Get('files/!*')
  // async getFiles(
  //   @Param('*') filename: string,
  //   @Query('prefix') prefix: string = '',
  //   @Query('bucket') bucket: string = 'files',
  //   @Res() res: Response,
  // ) {
  //   console.log(this.context.uploadPath, { bucket, prefix, filename });
  //   const fullFilePath = join(this.context.uploadPath, bucket, prefix, filename);
  //   if (fullFilePath.startsWith(this.context.uploadPath)) {
  //     logger.log(`check if file '${fullFilePath}' exists`);
  //     if (!fs.existsSync(fullFilePath)) {
  //       throw new NotFoundException();
  //     }
  //     res.sendFile(fullFilePath);
  //     // return UploaderController.fileStorageEngine.resolveUrl({ filename, bucket, prefix }, res);
  //   } else {
  //     res.send();
  //   }
  // }
}
