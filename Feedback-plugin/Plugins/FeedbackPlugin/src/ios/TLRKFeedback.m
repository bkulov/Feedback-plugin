//
//  FeedbackPlugin.m
//  FeedbackPlugin
//
//  Created by Stanislav Nedelchev on 3/3/14.
//  Copyright (c) 2014 Telerik. All rights reserved.
//

#import "TLRKFeedback.h"
#import <sys/types.h>
#import <sys/sysctl.h>
#import <Cordova/UIDevice+Extensions.h>

@implementation TLRKFeedback

@synthesize webView;

-(void)pluginInitialize
{
    // Intentionally empty.
}

-(NSString *)getDeviceModel
{
    size_t size = 100;
    char *hw_machine = malloc(size);
    int name[] = {CTL_HW,HW_MACHINE};
    sysctl(name, 2, hw_machine, &size, NULL, 0);
    NSString *platform = [NSString stringWithUTF8String:hw_machine];
    free(hw_machine);

    if ([platform isEqualToString:@"iPhone1,1"])    return @"iPhone 1G";
    if ([platform isEqualToString:@"iPhone1,2"])    return @"iPhone 3G";
    if ([platform isEqualToString:@"iPhone2,1"])    return @"iPhone 3GS";
    if ([platform isEqualToString:@"iPhone3,1"])    return @"iPhone 4";
    if ([platform isEqualToString:@"iPhone3,2"])    return @"iPhone 4 CDMA";
    if ([platform isEqualToString:@"iPhone3,3"])    return @"Verizon iPhone 4";
    if ([platform isEqualToString:@"iPhone4,1"])    return @"iPhone 4S";
    if ([platform isEqualToString:@"iPhone5,1"])    return @"iPhone 5 (GSM)";
    if ([platform isEqualToString:@"iPhone5,2"])    return @"iPhone 5 (GSM+CDMA)";
    if ([platform isEqualToString:@"iPod1,1"])      return @"iPod Touch 1G";
    if ([platform isEqualToString:@"iPod2,1"])      return @"iPod Touch 2G";
    if ([platform isEqualToString:@"iPod3,1"])      return @"iPod Touch 3G";
    if ([platform isEqualToString:@"iPod4,1"])      return @"iPod Touch 4G";
    if ([platform isEqualToString:@"iPod5,1"])      return @"iPod Touch 5G";
    if ([platform isEqualToString:@"iPad1,1"])      return @"iPad";
    if ([platform isEqualToString:@"iPad2,1"])      return @"iPad 2 WiFi";
    if ([platform isEqualToString:@"iPad2,2"])      return @"iPad 2 GSM";
    if ([platform isEqualToString:@"iPad2,3"])      return @"iPad 2 CDMA";
    if ([platform isEqualToString:@"iPad2,4"])      return @"iPad 2 CDMAS";
    if ([platform isEqualToString:@"iPad2,5"])      return @"iPad Mini Wifi";
    if ([platform isEqualToString:@"iPad2,6"])      return @"iPad Mini (GSM)";
    if ([platform isEqualToString:@"iPad2,7"])      return @"iPad Mini (GSM + CDMA)";
    if ([platform isEqualToString:@"iPad3,1"])      return @"iPad 3 WiFi";
    if ([platform isEqualToString:@"iPad3,2"])      return @"iPad 3 CDMA";
    if ([platform isEqualToString:@"iPad3,3"])      return @"iPad 3 GSM";
    if ([platform isEqualToString:@"iPad3,4"])      return @"iPad 4 Wifi";
    if ([platform isEqualToString:@"iPad3,5"])      return @"iPad 4 (GSM)";
    if ([platform isEqualToString:@"iPad3,6"])      return @"iPad 4 (GSM+CDMA)";
    if ([platform isEqualToString:@"i386"])         return @"Simulator";
    if ([platform isEqualToString:@"x86_64"])       return @"Simulator";
    return @"Unknown";
}

-(void)getSystemInfo:(CDVInvokedUrlCommand *)command
{
    NSMutableDictionary *deviceInfo = [[NSMutableDictionary alloc] init];

    CGRect screenBounds = [[UIScreen mainScreen] bounds];
    CGFloat screenScale = [[UIScreen mainScreen] scale];
    CGSize screenSize = CGSizeMake(screenBounds.size.width * screenScale, screenBounds.size.height * screenScale);

    UIDevice *device = [UIDevice currentDevice];
    deviceInfo[@"heightInPixels"] = [NSNumber numberWithFloat: screenSize.height];
    deviceInfo[@"widthInPixels"] = [NSNumber numberWithFloat: screenSize.width];
    deviceInfo[@"model"] = [self getDeviceModel];
    deviceInfo[@"OSVersion"] = [device systemVersion];
    deviceInfo[@"uuid"] = [device uniqueAppInstanceIdentifier];
    deviceInfo[@"cordova"] = CDV_VERSION;
    deviceInfo[@"appId"] = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleIdentifier"];
    deviceInfo[@"appVersion"] = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"];
    deviceInfo[@"appName"] = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleDisplayName"];

    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary:deviceInfo] callbackId:command.callbackId];
}

-(void)getScreenshot:(CDVInvokedUrlCommand *)command
{
    NSString *screenshotAsBase64 = [self getScreenshotAsBase64String];
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString:screenshotAsBase64];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (NSString *)getScreenshotAsBase64String
{
	CGRect imageRect;
	CGRect screenRect = [[UIScreen mainScreen] bounds];

	// statusBarOrientation is more reliable than UIDevice.orientation
	UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;

	if (orientation == UIInterfaceOrientationLandscapeLeft || orientation == UIInterfaceOrientationLandscapeRight) {
		// landscape check
		imageRect = CGRectMake(0, 0, CGRectGetHeight(screenRect), CGRectGetWidth(screenRect));
	} else {
		// portrait check
		imageRect = CGRectMake(0, 0, CGRectGetWidth(screenRect), CGRectGetHeight(screenRect));
	}

	// Adds support for Retina Display. Code reverts back to original if iOs 4 not detected.
	if (NULL != UIGraphicsBeginImageContextWithOptions)
    {
        UIGraphicsBeginImageContextWithOptions(imageRect.size, NO, 0);
    }
    else
    {
        UIGraphicsBeginImageContext(imageRect.size);
    }

	CGContextRef ctx = UIGraphicsGetCurrentContext();
	[[UIColor blackColor] set];
	CGContextTranslateCTM(ctx, 0, 0);
	CGContextFillRect(ctx, imageRect);

    [webView.layer renderInContext:ctx];

	UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
	UIGraphicsEndImageContext();

    NSData *base64Data = UIImagePNGRepresentation(image);
    NSString *base64String = [base64Data base64EncodedStringWithOptions:0];
    return base64String;
}

@end