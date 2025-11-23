#!/bin/bash
npm run build && \
sudo rm -rf /var/www/jammming/* && \
sudo cp -r dist/* /var/www/jammming/ && \
sudo chown -R www-data:www-data /var/www/jammming && \
sudo systemctl reload nginx && \
echo "jammming deployed successfully!"
