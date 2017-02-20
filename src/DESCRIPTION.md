This operator allows you to access any Business API Ecosystem GE usage API. In particular, this operator uses a set
of WireCloud URL query strings in order to determine the BAE instance server (server), the id of the product whose
usage is going to be retrieved (productId), and the access token of the owner of the product in order to be able to
access the usage info (token).

Note that this params are read in this way, instead of including them as settings, since this operator is intended
to build usage visualization dashboards to be embedded into the web portal of a BAE instance.

## References

* [Business API Ecosystem info](https://catalogue.fiware.org/enablers/business-api-ecosystem-biz-ecosystem-ri)
