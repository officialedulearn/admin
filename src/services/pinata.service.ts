import { PinataSDK } from 'pinata';
import { config } from '../lib/config';

export const pinataService = {
  async uploadFile(file: File): Promise<{ cid: string; url: string }> {
    try {
      const pinata = new PinataSDK({
        pinataJwt: config.pinataJwt,
        pinataGateway: config.pinataGateway,
      });

      const upload = await pinata.upload.public.file(file);
      const url = `https://${config.pinataGateway}/ipfs/${upload.cid}`;

      return {
        cid: upload.cid,
        url,
      };
    } catch (error) {
      console.error('Failed to upload file to Pinata:', error);
      throw error;
    }
  },

  async uploadJSON(json: object): Promise<{ cid: string; url: string }> {
    try {
      const pinata = new PinataSDK({
        pinataJwt: config.pinataJwt,
        pinataGateway: config.pinataGateway,
      });

      const upload = await pinata.upload.public.json(json);
      const url = `https://${config.pinataGateway}/ipfs/${upload.cid}`;

      return {
        cid: upload.cid,
        url,
      };
    } catch (error) {
      console.error('Failed to upload JSON to Pinata:', error);
      throw error;
    }
  },

  getIPFSUrl(cid: string): string {
    return `https://${config.pinataGateway}/ipfs/${cid}`;
  },
};

