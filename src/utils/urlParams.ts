export interface QueryParams {
  partId?: string;
  startDate?: string;
  endDate?: string;
  layerId?: string;
  emails?: string[];
}

export const parseUrlParams = (): QueryParams => {
  const params = new URLSearchParams(window.location.search);

  const queryParams: QueryParams = {};

  const partId = params.get('partId') || params.get('part_id');
  if (partId) queryParams.partId = partId;

  const startDate = params.get('startDate') || params.get('start_date');
  if (startDate) queryParams.startDate = startDate;

  const endDate = params.get('endDate') || params.get('end_date');
  if (endDate) queryParams.endDate = endDate;

  const layerId = params.get('layerId') || params.get('layer_id');
  if (layerId) queryParams.layerId = layerId;

  const emailsParam = params.get('emails');
  if (emailsParam) {
    queryParams.emails = emailsParam.split(',').map(e => e.trim()).filter(e => e);
  }

  return queryParams;
};

export const hasUrlParams = (params: QueryParams): boolean => {
  return Object.keys(params).length > 0;
};
